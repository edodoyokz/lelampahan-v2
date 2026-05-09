import { describe, expect, it } from 'vitest';
import { assertPaymentTransition, canTransitionPayment } from '@/domain/payment/state-machine';

describe('payment state machine', () => {
  it('allows pending payment to become paid, expired, or failed', () => {
    expect(canTransitionPayment('PENDING', 'PAID')).toBe(true);
    expect(canTransitionPayment('PENDING', 'EXPIRED')).toBe(true);
    expect(canTransitionPayment('PENDING', 'FAILED')).toBe(true);
  });

  it('allows paid payment to become refunded', () => {
    expect(canTransitionPayment('PAID', 'REFUNDED')).toBe(true);
  });

  it('rejects expired payment becoming paid through normal transition', () => {
    expect(canTransitionPayment('EXPIRED', 'PAID')).toBe(false);
    expect(() => assertPaymentTransition('EXPIRED', 'PAID')).toThrow('Invalid payment transition');
  });
});
