import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePaymentStatus } from '@/data/payment';
import { updateOrderStatus } from '@/data/booking';
import { handleApiError, parseBody } from '@/lib/errors';

const webhookSchema = z.object({
  provider: z.string(),
  eventId: z.string(),
  providerRef: z.string(),
  orderId: z.string(),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED']),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const event = webhookSchema.parse(body);

    await updatePaymentStatus(event.orderId, event.status, event.providerRef, event.eventId);

    if (event.status === 'PAID') {
      await updateOrderStatus(event.orderId, 'PAID');
    } else if (event.status === 'EXPIRED') {
      await updateOrderStatus(event.orderId, 'EXPIRED');
    }

    return NextResponse.json({
      received: true,
      orderId: event.orderId,
      status: event.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
