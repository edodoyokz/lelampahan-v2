import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaymentProvider } from '@/domain/payment/factory';
import { upsertPaymentRecord, findPendingPaymentOrderForUser } from '@/data/payment';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { DomainError } from '@/domain/shared/errors';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const paymentSchema = z.object({
  orderId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = paymentSchema.parse(body);
    const profile = await ensureUserProfileForAuthUser({
      authUserId: auth.user.id,
      email: auth.user.email,
      name:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : typeof auth.user.user_metadata?.name === 'string'
            ? auth.user.user_metadata.name
            : null,
    });

    const order = await findPendingPaymentOrderForUser(input.orderId, profile.id);
    if (!order) {
      throw new DomainError('ORDER_NOT_PAYABLE', 'Order is not payable');
    }

    const paymentProvider = getPaymentProvider();
    const paymentResult = await paymentProvider.createQrisPayment({
      orderId: order.id,
      amount: order.totalAmount,
      idempotencyKey: input.idempotencyKey,
      orderNumber: order.orderNumber,
    });

    // upsertPaymentRecord handles the case where a previous EXPIRED/FAILED payment
    // exists for this order, allowing the customer to retry checkout safely.
    const persisted = await upsertPaymentRecord({
      orderId: order.id,
      provider: paymentResult.provider,
      method: paymentResult.method,
      amount: paymentResult.amount,
      idempotencyKey: input.idempotencyKey,
      expiresAt: paymentResult.expiresAt,
      providerRef: paymentResult.providerRef,
      rawPayload: paymentResult.rawPayload,
    });

    return NextResponse.json(
      {
        ...persisted,
        qrString: paymentResult.qrString,
        providerRef: paymentResult.providerRef,
        rawPayload: paymentResult.rawPayload,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
