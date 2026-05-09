import { NextResponse } from 'next/server';
import { z } from 'zod';

const webhookSchema = z.object({
  provider: z.string(),
  eventId: z.string(),
  providerRef: z.string(),
  orderId: z.string(),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED']),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 422 });
  }

  // Placeholder: normalize event and update order status
  const { orderId, status } = parsed.data;

  return NextResponse.json({
    received: true,
    orderId,
    status,
    timestamp: new Date().toISOString(),
  });
}
