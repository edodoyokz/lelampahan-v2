import { describe, expect, it } from 'vitest';
import { generateOrderNumber } from '@/lib/order-number';
import { createInstantCheckout } from '@/domain/booking/checkout';
import { createQrisPayment } from '@/domain/payment/qris-mock';
import { issueTicket } from '@/domain/ticket/service';
import { assertOrderTransition } from '@/domain/booking/state-machine';
import { verifyTicketToken } from '@/domain/ticket/token';

const SECRET = 'test-secret-for-integration-test';

describe('instant checkout → payment → ticket flow', () => {
  it('creates pending order, processes mock payment, issues tickets', () => {
    const orderNumber = generateOrderNumber();

    // 1. Create checkout order
    const order = createInstantCheckout({
      userId: 'user-1',
      sessionId: 'session-1',
      ticketTypeId: 'ticket-type-1',
      quantity: 2,
      unitPrice: 50000,
      totalAmount: 100000,
      orderNumber,
    });

    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.totalAmount).toBe(100000);

    // 2. Verify state machine allows this transition
    assertOrderTransition('DRAFT', 'PENDING_PAYMENT');

    // 3. Create QRIS payment
    const payment = createQrisPayment({
      orderId: orderNumber,
      amount: order.totalAmount,
      idempotencyKey: `payment:create:user-1:${orderNumber}:1`,
      orderNumber,
    });

    expect(payment.status).toBe('PENDING');
    expect(payment.method).toBe('QRIS');
    expect(payment.qrString).toContain('lelampahan://qris');

    // 4. Simulate paid webhook: transition order state
    assertOrderTransition('PENDING_PAYMENT', 'PAID');

    // 5. Issue tickets for each participant
    const ticket1 = issueTicket({
      orderId: orderNumber,
      code: `${orderNumber}-001`,
      participantName: 'Budi',
      participantEmail: 'budi@example.com',
      participantPhone: '0811',
      tokenSecret: SECRET,
    });

    const ticket2 = issueTicket({
      orderId: orderNumber,
      code: `${orderNumber}-002`,
      participantName: 'Siti',
      participantEmail: 'siti@example.com',
      participantPhone: '0812',
      tokenSecret: SECRET,
    });

    expect(ticket1.status).toBe('ISSUED');
    expect(ticket2.status).toBe('ISSUED');

    // 6. Verify tokens can be decoded
    const decoded1 = verifyTicketToken(ticket1.token, SECRET);
    expect(decoded1.ticketCode).toBe(`${orderNumber}-001`);

    const decoded2 = verifyTicketToken(ticket2.token, SECRET);
    expect(decoded2.ticketCode).toBe(`${orderNumber}-002`);

    // 7. Verify the flow completes with correct amounts
    expect(payment.amount).toBe(order.totalAmount);
    expect(ticket1.orderId).toBe(orderNumber);
  });
});
