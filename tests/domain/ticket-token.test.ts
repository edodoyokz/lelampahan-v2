import { describe, expect, it } from 'vitest';
import { createTicketToken, verifyTicketToken } from '@/domain/ticket/token';

describe('ticket token', () => {
  it('creates and verifies an HMAC signed token', () => {
    const token = createTicketToken({ ticketCode: 'TICKET-123', nonce: 'nonce-1' }, 'secret-key');

    expect(token).toContain('v1.');
    expect(verifyTicketToken(token, 'secret-key')).toEqual({
      version: 'v1',
      ticketCode: 'TICKET-123',
      nonce: 'nonce-1',
    });
  });

  it('rejects tokens signed with another secret', () => {
    const token = createTicketToken({ ticketCode: 'TICKET-123', nonce: 'nonce-1' }, 'secret-key');

    expect(() => verifyTicketToken(token, 'wrong-secret')).toThrow('Invalid ticket token signature');
  });

  it('rejects malformed tokens', () => {
    expect(() => verifyTicketToken('not-a-token', 'secret-key')).toThrow('Malformed ticket token');
  });
});
