import { describe, expect, it } from 'vitest';
import {
  assertBookingRequestTransition,
  assertOrderTransition,
  canTransitionBookingRequest,
  canTransitionOrder,
} from '@/domain/booking/state-machine';

describe('order state machine', () => {
  it('allows instant checkout to move from draft to pending payment to paid', () => {
    expect(canTransitionOrder('DRAFT', 'PENDING_PAYMENT')).toBe(true);
    expect(canTransitionOrder('PENDING_PAYMENT', 'PAID')).toBe(true);
  });

  it('allows pending payment to expire or cancel', () => {
    expect(canTransitionOrder('PENDING_PAYMENT', 'EXPIRED')).toBe(true);
    expect(canTransitionOrder('PENDING_PAYMENT', 'CANCELLED')).toBe(true);
  });

  it('rejects invalid order transitions', () => {
    expect(canTransitionOrder('EXPIRED', 'PAID')).toBe(false);
    expect(() => assertOrderTransition('EXPIRED', 'PAID')).toThrow('Invalid order transition');
  });

  it('allows paid orders to enter refund flow', () => {
    expect(canTransitionOrder('PAID', 'REFUND_REQUESTED')).toBe(true);
    expect(canTransitionOrder('REFUND_REQUESTED', 'REFUNDED')).toBe(true);
    expect(canTransitionOrder('REFUND_REQUESTED', 'REFUND_REJECTED')).toBe(true);
  });
});

describe('booking request state machine', () => {
  it('allows request-to-book approval and payment', () => {
    expect(canTransitionBookingRequest('REQUESTED', 'PARTNER_APPROVED')).toBe(true);
    expect(canTransitionBookingRequest('PARTNER_APPROVED', 'PENDING_PAYMENT')).toBe(true);
    expect(canTransitionBookingRequest('PENDING_PAYMENT', 'PAID')).toBe(true);
  });

  it('allows partner rejection and expiry', () => {
    expect(canTransitionBookingRequest('REQUESTED', 'PARTNER_REJECTED')).toBe(true);
    expect(canTransitionBookingRequest('PARTNER_APPROVED', 'EXPIRED')).toBe(true);
    expect(canTransitionBookingRequest('PENDING_PAYMENT', 'PAYMENT_EXPIRED')).toBe(true);
  });

  it('rejects invalid request transitions', () => {
    expect(canTransitionBookingRequest('PARTNER_REJECTED', 'PAID')).toBe(false);
    expect(() => assertBookingRequestTransition('PARTNER_REJECTED', 'PAID')).toThrow(
      'Invalid booking request transition',
    );
  });
});
