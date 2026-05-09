import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingRequest } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';

const requestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
  message: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  try {
    const booking = createBookingRequest({
      ...parsed.data,
      orderNumber: generateOrderNumber(),
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
