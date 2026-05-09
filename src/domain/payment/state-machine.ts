import { DomainError } from '@/domain/shared/errors';

export type PaymentState = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';

const paymentTransitions: Record<PaymentState, PaymentState[]> = {
  PENDING: ['PAID', 'EXPIRED', 'FAILED'],
  PAID: ['REFUNDED'],
  EXPIRED: [],
  FAILED: [],
  REFUNDED: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return paymentTransitions[from].includes(to);
}

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!canTransitionPayment(from, to)) {
    throw new DomainError(
      'INVALID_PAYMENT_TRANSITION',
      `Invalid payment transition: ${from} -> ${to}`,
      { from, to },
    );
  }
}
