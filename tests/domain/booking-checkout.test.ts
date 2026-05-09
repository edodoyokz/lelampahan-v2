import { describe, expect, it } from 'vitest';
import { createInstantCheckout, createBookingRequest } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';

describe('checkout', () => {
  it('creates an instant checkout order with pending payment status', () => {
    const order = createInstantCheckout({
      userId: 'user-1',
      sessionId: 'session-1',
      ticketTypeId: 'tickettype-1',
      quantity: 2,
      unitPrice: 50000,
      totalAmount: 100000,
      orderNumber: generateOrderNumber(),
    });

    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.totalAmount).toBe(100000);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].subtotal).toBe(100000);
  });

  it('creates a request-to-book order in requested status', () => {
    const request = createBookingRequest({
      userId: 'user-2',
      sessionId: 'session-2',
      ticketTypeId: 'tickettype-2',
      quantity: 1,
      unitPrice: 200000,
      totalAmount: 200000,
      orderNumber: generateOrderNumber(),
      message: 'Pagi jam 9 bisa?',
    });

    expect(request.status).toBe('REQUESTED');
    expect(request.userMessage).toBe('Pagi jam 9 bisa?');
  });

  it('rejects zero quantity', () => {
    expect(() =>
      createInstantCheckout({
        userId: 'user-1',
        sessionId: 'session-1',
        ticketTypeId: 'tickettype-1',
        quantity: 0,
        unitPrice: 50000,
        totalAmount: 0,
        orderNumber: generateOrderNumber(),
      }),
    ).toThrow('Quantity must be at least 1');
  });
});
