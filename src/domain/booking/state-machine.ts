import { DomainError } from '@/domain/shared/errors';

export type OrderState =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_REJECTED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'NEEDS_ADMIN_REVIEW';

export type BookingRequestState =
  | 'REQUESTED'
  | 'PARTNER_APPROVED'
  | 'PARTNER_REJECTED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'PAYMENT_EXPIRED'
  | 'REFUND_REQUESTED';

const orderTransitions: Record<OrderState, OrderState[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAID', 'EXPIRED', 'CANCELLED', 'NEEDS_ADMIN_REVIEW'],
  PAID: ['COMPLETED', 'REFUND_REQUESTED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
  COMPLETED: ['REFUND_REQUESTED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
  EXPIRED: ['NEEDS_ADMIN_REVIEW'],
  CANCELLED: [],
  REFUND_REQUESTED: ['REFUNDED', 'REFUND_REJECTED', 'PARTIALLY_REFUNDED'],
  REFUND_REJECTED: ['COMPLETED'],
  PARTIALLY_REFUNDED: ['COMPLETED', 'REFUND_REQUESTED', 'REFUNDED'],
  REFUNDED: [],
  NEEDS_ADMIN_REVIEW: ['PAID', 'REFUNDED', 'CANCELLED'],
};

const bookingRequestTransitions: Record<BookingRequestState, BookingRequestState[]> = {
  REQUESTED: ['PARTNER_APPROVED', 'PARTNER_REJECTED', 'EXPIRED'],
  PARTNER_APPROVED: ['PENDING_PAYMENT', 'EXPIRED'],
  PARTNER_REJECTED: [],
  PENDING_PAYMENT: ['PAID', 'PAYMENT_EXPIRED'],
  PAID: ['COMPLETED', 'REFUND_REQUESTED'],
  COMPLETED: ['REFUND_REQUESTED'],
  EXPIRED: [],
  PAYMENT_EXPIRED: ['EXPIRED'],
  REFUND_REQUESTED: ['COMPLETED'],
};

export function canTransitionOrder(from: OrderState, to: OrderState): boolean {
  return orderTransitions[from].includes(to);
}

export function assertOrderTransition(from: OrderState, to: OrderState): void {
  if (!canTransitionOrder(from, to)) {
    throw new DomainError('INVALID_ORDER_TRANSITION', `Invalid order transition: ${from} -> ${to}`, {
      from,
      to,
    });
  }
}

export function canTransitionBookingRequest(
  from: BookingRequestState,
  to: BookingRequestState,
): boolean {
  return bookingRequestTransitions[from].includes(to);
}

export function assertBookingRequestTransition(
  from: BookingRequestState,
  to: BookingRequestState,
): void {
  if (!canTransitionBookingRequest(from, to)) {
    throw new DomainError(
      'INVALID_BOOKING_REQUEST_TRANSITION',
      `Invalid booking request transition: ${from} -> ${to}`,
      { from, to },
    );
  }
}
