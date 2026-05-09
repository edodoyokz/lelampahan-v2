import { BookingRequest } from './checkout';

export function approveBookingRequest(request: BookingRequest): BookingRequest & { status: 'PARTNER_APPROVED' } {
  if (request.status !== 'REQUESTED') {
    throw new Error('Only requested booking can be approved');
  }
  return { ...request, status: 'PARTNER_APPROVED' };
}

export function rejectBookingRequest(request: BookingRequest): BookingRequest & { status: 'PARTNER_REJECTED' } {
  if (request.status !== 'REQUESTED') {
    throw new Error('Only requested booking can be rejected');
  }
  return { ...request, status: 'PARTNER_REJECTED' };
}
