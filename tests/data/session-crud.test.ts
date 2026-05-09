import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sessionDeleteMany: vi.fn(),
  sessionCreate: vi.fn(),
  ticketTypeCreate: vi.fn(),
  sessionFindMany: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    session: {
      deleteMany: mocks.sessionDeleteMany,
      create: mocks.sessionCreate,
      findMany: mocks.sessionFindMany,
    },
    ticketType: { create: mocks.ticketTypeCreate },
  },
}));

import { replaceListingSessions } from '@/data/session';

describe('replace listing sessions', () => {
  const sessionsPayload = [
    {
      startsAt: new Date('2026-06-01T09:00:00Z'),
      endsAt: new Date('2026-06-01T13:00:00Z'),
      capacity: 10,
      bookingCutoff: new Date('2026-05-31T09:00:00Z'),
      ticketTypes: [
        { name: 'Regular', price: 50000, quota: 8 },
        { name: 'VIP', price: 150000, quota: 2 },
      ],
    },
  ];

  it('deletes old sessions then creates new ones with ticket types', async () => {
    mocks.sessionDeleteMany.mockResolvedValueOnce({ count: 2 });
    mocks.sessionCreate
      .mockResolvedValueOnce({ id: 'session-1' });
    mocks.ticketTypeCreate
      .mockResolvedValueOnce({ id: 'tt-1' });
    mocks.sessionFindMany.mockResolvedValueOnce([]);

    await replaceListingSessions('listing-1', sessionsPayload);

    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: { listingId: 'listing-1' },
    });

    expect(mocks.sessionCreate).toHaveBeenCalledWith({
      data: {
        listingId: 'listing-1',
        startsAt: sessionsPayload[0].startsAt,
        endsAt: sessionsPayload[0].endsAt,
        capacity: sessionsPayload[0].capacity,
        bookingCutoff: sessionsPayload[0].bookingCutoff,
      },
    });

    expect(mocks.ticketTypeCreate).toHaveBeenCalledTimes(2);
    expect(mocks.ticketTypeCreate).toHaveBeenCalledWith({
      data: { sessionId: 'session-1', name: 'Regular', price: 50000, quota: 8 },
    });
    expect(mocks.ticketTypeCreate).toHaveBeenCalledWith({
      data: { sessionId: 'session-1', name: 'VIP', price: 150000, quota: 2 },
    });
  });
});
