import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQrisPayment } from '@/domain/payment/qris-mock';

const paymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().min(0),
  idempotencyKey: z.string().min(1),
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  const payment = createQrisPayment(parsed.data);
  return NextResponse.json(payment, { status: 201 });
}
