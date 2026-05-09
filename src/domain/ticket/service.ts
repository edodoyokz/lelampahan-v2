import { createTicketToken } from './token';

export interface TicketData {
  id: string;
  code: string;
  orderId: string;
  status: 'ISSUED' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED' | 'VOID';
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  checkedInAt: Date | null;
  token: string;
}

let ticketCounter = 1;

export function issueTicket(input: {
  orderId: string;
  code: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  tokenSecret: string;
}): TicketData {
  const id = `ticket-${ticketCounter++}`;
  const nonce = `n-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const token = createTicketToken({ ticketCode: input.code, nonce }, input.tokenSecret);

  return {
    id,
    code: input.code,
    orderId: input.orderId,
    status: 'ISSUED',
    participantName: input.participantName,
    participantEmail: input.participantEmail,
    participantPhone: input.participantPhone,
    checkedInAt: null,
    token,
  };
}

export function markTicketCheckedIn(ticket: TicketData): TicketData {
  if (ticket.status === 'CHECKED_IN') {
    throw new Error('Ticket already checked in');
  }
  if (ticket.status !== 'ISSUED') {
    throw new Error('Only issued tickets can be checked in');
  }
  return { ...ticket, status: 'CHECKED_IN', checkedInAt: new Date() };
}
