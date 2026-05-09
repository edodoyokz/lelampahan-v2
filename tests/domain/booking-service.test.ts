import { describe, expect, it } from 'vitest';
import {
  approveBookingRequest,
  rejectBookingRequest,
} from '@/domain/booking/service';
import { BookingRequest } from '@/domain/booking/checkout';

const makeRequest = (overrides: Partial<BookingRequest> = {}): BookingRequest => ({
  orderNumber: 'LM-20260509-ABCD',
  userId: 'user-1',
  sessionId: 'session-1',
  status: 'REQUESTED',
  totalAmount: 100000,
  items: [],
  ...overrides,
});

describe('booking service', () => {
  it('approves a requested booking', () => {
    const approved = approveBookingRequest(makeRequest());
    expect(approved.status).toBe('PARTNER_APPROVED');
  });

  it('rejects a requested booking', () => {
    const rejected = rejectBookingRequest(makeRequest());
    expect(rejected.status).toBe('PARTNER_REJECTED');
  });

  it('throws when approving a non-requested booking', () => {
    expect(() =>
      approveBookingRequest(makeRequest({ status: 'PAID' })),
    ).toThrow('Only requested booking can be approved');
  });
});
