import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQrisPayment } from '@/domain/payment/qris-mock';
import { createPaymentRecord } from '@/data/payment';
import { handleApiError, parseBody } from '@/lib/errors';

const paymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().min(0),
  idempotencyKey: z.string().min(1),
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = paymentSchema.parse(body);

    const paymentResult = createQrisPayment(input);

    const persisted = await createPaymentRecord({
      orderId: input.orderId,
      provider: paymentResult.provider,
      method: paymentResult.method,
      amount: paymentResult.amount,
      idempotencyKey: input.idempotencyKey,
      expiresAt: paymentResult.expiresAt,
    });

    return NextResponse.json(persisted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
