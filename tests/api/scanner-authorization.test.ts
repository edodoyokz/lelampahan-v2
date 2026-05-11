import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireApiPartnerContext: vi.fn(),
  verifyTicketToken: vi.fn(),
  findTicketByCode: vi.fn(),
  recordCheckIn: vi.fn(),
  markTicketCheckedInDb: vi.fn(),
}));

vi.mock('@/lib/auth/api', () => ({ requireApiPartnerContext: mocks.requireApiPartnerContext }));
vi.mock('@/domain/ticket/token', () => ({ verifyTicketToken: mocks.verifyTicketToken }));
vi.mock('@/config/env', () => ({ env: { TICKET_TOKEN_SECRET: 'secret' } }));
vi.mock('@/data/ticket', () => ({
  findTicketByCode: mocks.findTicketByCode,
  recordCheckIn: mocks.recordCheckIn,
  markTicketCheckedInDb: mocks.markTicketCheckedInDb,
}));

import { POST } from '../../app/api/scanner/validate/route';

describe('scanner validation authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiPartnerContext.mockResolvedValue({
      response: null,
      user: { id: 'auth-1' },
      context: { userProfileId: 'profile-1', partner: { id: 'partner-1' } },
    });
    mocks.verifyTicketToken.mockReturnValue({ ticketCode: 'TICKET-1' });
  });

  it('returns auth response for anonymous request', async () => {
    mocks.requireApiPartnerContext.mockResolvedValueOnce({
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
      context: null,
    });

    const response = await POST(new Request('https://test.local', {
      method: 'POST',
      body: JSON.stringify({ token: 'token', sessionId: 'session-1' }),
    }));

    expect(response.status).toBe(401);
    expect(mocks.findTicketByCode).not.toHaveBeenCalled();
  });

  it('returns wrong scope when ticket session does not match requested session', async () => {
    mocks.findTicketByCode.mockResolvedValueOnce({
      id: 'ticket-1',
      status: 'ISSUED',
      order: { sessionId: 'session-2', session: { listing: { partnerId: 'partner-1' } } },
    });

    const response = await POST(new Request('https://test.local', {
      method: 'POST',
      body: JSON.stringify({ token: 'token', sessionId: 'session-1' }),
    }));

    await expect(response.json()).resolves.toEqual({ valid: false, result: 'WRONG_SCOPE' });
    expect(mocks.recordCheckIn).toHaveBeenCalledWith({ ticketId: 'ticket-1', staffId: 'profile-1', result: 'WRONG_SCOPE' });
    expect(mocks.markTicketCheckedInDb).not.toHaveBeenCalled();
  });

  it('returns wrong scope when ticket partner does not match scanner partner', async () => {
    mocks.findTicketByCode.mockResolvedValueOnce({
      id: 'ticket-1',
      status: 'ISSUED',
      order: { sessionId: 'session-1', session: { listing: { partnerId: 'partner-2' } } },
    });

    const response = await POST(new Request('https://test.local', {
      method: 'POST',
      body: JSON.stringify({ token: 'token', sessionId: 'session-1' }),
    }));

    await expect(response.json()).resolves.toEqual({ valid: false, result: 'WRONG_SCOPE' });
    expect(mocks.recordCheckIn).toHaveBeenCalledWith({ ticketId: 'ticket-1', staffId: 'profile-1', result: 'WRONG_SCOPE' });
  });

  it('records valid check-in with authenticated staff profile id', async () => {
    mocks.findTicketByCode.mockResolvedValueOnce({
      id: 'ticket-1',
      status: 'ISSUED',
      order: { sessionId: 'session-1', session: { listing: { partnerId: 'partner-1' } } },
    });

    const response = await POST(new Request('https://test.local', {
      method: 'POST',
      body: JSON.stringify({ token: 'token', sessionId: 'session-1' }),
    }));

    const body = await response.json();
    expect(body.valid).toBe(true);
    expect(body.result).toBe('VALID');
    expect(mocks.recordCheckIn).toHaveBeenCalledWith({ ticketId: 'ticket-1', staffId: 'profile-1', result: 'VALID' });
    expect(mocks.markTicketCheckedInDb).toHaveBeenCalledWith('ticket-1');
  });
});
