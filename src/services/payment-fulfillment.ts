import { findOrderById } from '@/data/booking';
import { DomainError } from '@/domain/shared/errors';
import { issueTicketsAndNotify } from '@/services/ticket-notification';

export async function fulfillPaidOrder(input: {
  orderId: string;
  tokenSecret: string;
}): Promise<{ ticketsIssued: number; emailsSent: number; skipped?: string }> {
  const order = await findOrderById(input.orderId);

  if (!order) {
    throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
  }

  if (order.tickets.length > 0) {
    return { ticketsIssued: 0, emailsSent: 0, skipped: 'tickets_already_issued' };
  }

  if (!order.participants || order.participants.length === 0) {
    throw new DomainError('ORDER_PARTICIPANTS_MISSING', 'Order participants are required');
  }

  const listingTitle = order.session?.listing?.title ?? 'Lelampahan';
  const result = await issueTicketsAndNotify({
    orderId: order.id,
    orderNumber: order.orderNumber,
    listingTitle,
    participants: order.participants.map((participant) => ({
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
    })),
    tokenSecret: input.tokenSecret,
  });

  return { ticketsIssued: result.tickets.length, emailsSent: result.emailsSent };
}
