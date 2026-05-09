import { DomainError } from '@/domain/shared/errors';

export const DEFAULT_RESERVATION_TTL_MINUTES = 30;

export function createReservationExpiry(
  now: Date,
  ttlMinutes: number = DEFAULT_RESERVATION_TTL_MINUTES,
): Date {
  return new Date(now.getTime() + ttlMinutes * 60 * 1000);
}

export function calculateAvailableCapacity(input: {
  capacity: number;
  soldQuantity: number;
  activeReservedQuantity: number;
}): number {
  return Math.max(0, input.capacity - input.soldQuantity - input.activeReservedQuantity);
}

export function ensureCapacityAvailable(input: {
  capacity: number;
  soldQuantity: number;
  activeReservedQuantity: number;
  requestedQuantity: number;
}): void {
  const available = calculateAvailableCapacity(input);

  if (input.requestedQuantity < 1) {
    throw new DomainError('INVALID_RESERVATION_QUANTITY', 'Reservation quantity must be at least 1');
  }

  if (input.requestedQuantity > available) {
    throw new DomainError('INSUFFICIENT_CAPACITY', 'Not enough capacity available', {
      available,
      requestedQuantity: input.requestedQuantity,
    });
  }
}
