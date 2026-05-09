import { NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { markOrderPaidAndConsumeReservation, updateOrderStatus } from '@/data/booking';
import { updatePaymentStatus } from '@/data/payment';
import { env } from '@/config/env';
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

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    assertWebhookSignature(
      rawBody,
      request.headers.get('x-lelampahan-signature'),
      env.PAYMENT_WEBHOOK_SECRET,
    );

    const event = webhookSchema.parse(JSON.parse(rawBody));
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
