import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createInstantCheckout } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';
import { createOrder } from '@/data/booking';
import { handleApiError, parseBody } from '@/lib/errors';

const checkoutSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = checkoutSchema.parse(body);
    const orderNumber = generateOrderNumber();

    const checkoutOrder = createInstantCheckout({ ...input, orderNumber });

    const persisted = await createOrder({
      orderNumber,
      userId: input.userId,
      sessionId: input.sessionId,
      totalAmount: input.totalAmount,
      status: checkoutOrder.status,
      items: checkoutOrder.items.map((item) => ({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    });

    return NextResponse.json(persisted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
