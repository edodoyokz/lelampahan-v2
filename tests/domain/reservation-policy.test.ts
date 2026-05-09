import { describe, expect, it } from 'vitest';
import {
  calculateAvailableCapacity,
  createReservationExpiry,
  ensureCapacityAvailable,
} from '@/domain/booking/reservation-policy';

describe('reservation policy', () => {
  it('uses 30 minutes as default reservation expiry', () => {
    const now = new Date('2026-05-09T10:00:00.000Z');
    expect(createReservationExpiry(now).toISOString()).toBe('2026-05-09T10:30:00.000Z');
  });

  it('calculates capacity after sold and active reservations', () => {
    expect(
      calculateAvailableCapacity({
        capacity: 10,
        soldQuantity: 4,
        activeReservedQuantity: 3,
      }),
    ).toBe(3);
  });

  it('does not return negative availability', () => {
    expect(
      calculateAvailableCapacity({
        capacity: 5,
        soldQuantity: 4,
        activeReservedQuantity: 4,
      }),
    ).toBe(0);
  });

  it('allows reservation when requested quantity fits', () => {
    expect(() =>
      ensureCapacityAvailable({ capacity: 10, soldQuantity: 4, activeReservedQuantity: 3, requestedQuantity: 3 }),
    ).not.toThrow();
  });

  it('rejects reservation when requested quantity exceeds available capacity', () => {
    expect(() =>
      ensureCapacityAvailable({ capacity: 10, soldQuantity: 4, activeReservedQuantity: 3, requestedQuantity: 4 }),
    ).toThrow('Not enough capacity available');
  });
});
