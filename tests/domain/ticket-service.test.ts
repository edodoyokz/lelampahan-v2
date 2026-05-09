import { describe, expect, it } from 'vitest';
import { issueTicket, markTicketCheckedIn } from '@/domain/ticket/service';
import { verifyTicketToken } from '@/domain/ticket/token';

const SECRET = 'test-secret-at-least-16-chars';

describe('ticket service', () => {
  it('issues a ticket with signed token', () => {
    const ticket = issueTicket({
      orderId: 'order-1',
      code: 'TICKET-001',
      participantName: 'Budi Santoso',
      participantEmail: 'budi@example.com',
      participantPhone: '08123456789',
      tokenSecret: SECRET,
    });

    expect(ticket.status).toBe('ISSUED');
    expect(ticket.code).toBe('TICKET-001');

    const decoded = verifyTicketToken(ticket.token, SECRET);
    expect(decoded.ticketCode).toBe('TICKET-001');
  });

  it('marks ticket as checked in', () => {
    const ticket = issueTicket({
      orderId: 'order-1',
      code: 'TICKET-002',
      participantName: 'Siti',
      participantEmail: 'siti@example.com',
      participantPhone: '0',
      tokenSecret: SECRET,
    });

    const checked = markTicketCheckedIn(ticket);
    expect(checked.status).toBe('CHECKED_IN');
    expect(checked.checkedInAt).toBeInstanceOf(Date);
  });

  it('throws when checking in an already checked in ticket', () => {
    const ticket = issueTicket({
      orderId: 'order-1',
      code: 'TICKET-003',
      participantName: 'Test',
      participantEmail: 'test@example.com',
      participantPhone: '0',
      tokenSecret: SECRET,
    });

    const checked = markTicketCheckedIn(ticket);
    expect(() => markTicketCheckedIn(checked)).toThrow('Ticket already checked in');
  });
});
