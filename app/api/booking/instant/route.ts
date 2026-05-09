import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createInstantCheckout } from '@/domain/booking/checkout';
import { createReservationExpiry } from '@/domain/booking/reservation-policy';
import { generateOrderNumber } from '@/lib/order-number';
import { createReservedOrder } from '@/data/booking';
import { handleApiError, parseBody } from '@/lib/errors';

const participantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

const checkoutSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
  participants: z.array(participantSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = checkoutSchema.parse(body);
    const orderNumber = generateOrderNumber();
    const expiresAt = createReservationExpiry(new Date());

    createInstantCheckout({ ...input, orderNumber });

    const persisted = await createReservedOrder({
      orderNumber,
      userId: input.userId,
      sessionId: input.sessionId,
      ticketTypeId: input.ticketTypeId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalAmount: input.totalAmount,
      participants: input.participants,
      expiresAt,
    });

    return NextResponse.json(persisted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
