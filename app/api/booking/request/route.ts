import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingRequest } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const requestSchema = z.object({
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
    const booking = createBookingRequest({
      ...input,
      userId: profile.id,
      orderNumber: generateOrderNumber(),
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
