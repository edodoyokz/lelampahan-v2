import { NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { findOrderByOrderNumber, markOrderPaidAndConsumeReservation, updateOrderStatus } from '@/data/booking';
import { updatePaymentStatus } from '@/data/payment';
import { env } from '@/config/env';
import { fetchPakasirTransactionDetail } from '@/domain/payment/pakasir';
import { DomainError } from '@/domain/shared/errors';
import { assertWebhookSignature } from '@/domain/payment/webhook-signature';
import { fulfillPaidOrder } from '@/services/payment-fulfillment';
import { createLedgerForPaidOrder } from '@/data/settlement';
import { recordAuditLog } from '@/data/audit';
import { handleApiError } from '@/lib/errors';

const webhookSchema = z.object({
  provider: z.string(),
  eventId: z.string(),
  providerRef: z.string(),
  orderId: z.string(),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED']),
});

const pakasirWebhookSchema = z.object({
  amount: z.number().int().nonnegative(),
  order_id: z.string().min(1),
  project: z.string().min(1),
  status: z.string().min(1),
  payment_method: z.string().min(1),
  completed_at: z.string().optional(),
});

type NormalizedWebhookEvent = z.infer<typeof webhookSchema>;

async function normalizePakasirWebhook(rawEvent: unknown): Promise<NormalizedWebhookEvent> {
  const event = pakasirWebhookSchema.parse(rawEvent);
  const projectSlug = process.env.PAKASIR_PROJECT_SLUG;
  const apiKey = process.env.PAKASIR_API_KEY;
  const mode = process.env.PAKASIR_MODE === 'production' ? 'production' : 'sandbox';

  if (!projectSlug || !apiKey) {
    throw new DomainError('PAKASIR_CONFIG_MISSING', 'Pakasir configuration is incomplete');
  }

  if (event.project !== projectSlug) {
    throw new DomainError('PAKASIR_PROJECT_MISMATCH', 'Pakasir webhook project mismatch');
  }

  if (event.payment_method !== 'qris') {
    throw new DomainError('PAKASIR_INVALID_METHOD', 'Pakasir webhook payment method is not QRIS');
  }

  const order = await findOrderByOrderNumber(event.order_id);
  if (!order) {
    throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
  }

  if (event.amount !== order.totalAmount) {
    throw new DomainError('PAKASIR_AMOUNT_MISMATCH', 'Pakasir webhook amount mismatch');
  }

  const detail = await fetchPakasirTransactionDetail({
    projectSlug,
    apiKey,
    mode,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
  });

  if (detail.status !== 'completed' || detail.payment_method !== 'qris') {
    throw new DomainError('PAKASIR_PAYMENT_NOT_COMPLETED', 'Pakasir payment is not completed');
  }

  return {
    provider: 'PAKASIR',
    eventId: `pakasir:completed:${order.orderNumber}`,
    providerRef: order.orderNumber,
    orderId: order.id,
    status: 'PAID',
  };
}

function isPakasirWebhook(rawEvent: unknown): boolean {
  if (!rawEvent || typeof rawEvent !== 'object') return false;
  return 'order_id' in rawEvent && 'project' in rawEvent && 'payment_method' in rawEvent;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const rawEvent = JSON.parse(rawBody) as unknown;

    let event: NormalizedWebhookEvent;
    if (isPakasirWebhook(rawEvent)) {
      event = await normalizePakasirWebhook(rawEvent);
    } else {
      assertWebhookSignature(
        rawBody,
        request.headers.get('x-lelampahan-signature'),
        env.PAYMENT_WEBHOOK_SECRET,
      );
      event = webhookSchema.parse(rawEvent);
    }
    await updatePaymentStatus(
      event.orderId,
      event.status as PaymentStatus,
      event.providerRef,
      event.eventId,
      event,
    );

    let fulfillment: Awaited<ReturnType<typeof fulfillPaidOrder>> | undefined;

    if (event.status === 'PAID') {
      const paidOrder = await markOrderPaidAndConsumeReservation(event.orderId);
      await createLedgerForPaidOrder({
        orderId: paidOrder.id,
        partnerId: paidOrder.partnerId,
        grossAmount: paidOrder.totalAmount,
      });
      fulfillment = await fulfillPaidOrder({
        orderId: event.orderId,
        tokenSecret: env.TICKET_TOKEN_SECRET,
      });
    } else if (event.status === 'EXPIRED') {
      await updateOrderStatus(event.orderId, OrderStatus.EXPIRED);
    }

    await recordAuditLog({
      action: `payment.webhook.${event.status.toLowerCase()}`,
      entityType: 'Payment',
      entityId: event.orderId,
      metadata: event,
    });

    return NextResponse.json({
      received: true,
      orderId: event.orderId,
      status: event.status,
      fulfillment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
