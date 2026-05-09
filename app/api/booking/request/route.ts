import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingRequest } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

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
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = requestSchema.parse(body);
    const booking = createBookingRequest({
      ...input,
      orderNumber: generateOrderNumber(),
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
