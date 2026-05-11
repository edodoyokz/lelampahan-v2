import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ticketFindUnique: vi.fn(),
  ticketUpdateMany: vi.fn(),
  checkInCreate: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    ticket: {
      findUnique: mocks.ticketFindUnique,
      updateMany: mocks.ticketUpdateMany,
    },
    checkIn: { create: mocks.checkInCreate },
  },
}));

import { findTicketByCode, markTicketCheckedInIfIssued } from '@/data/ticket';

describe('partner ticket scanner data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads ticket with order/session/listing partner scope for scanner validation', async () => {
    mocks.ticketFindUnique.mockResolvedValueOnce(null);

    await findTicketByCode('ABC123');

    expect(mocks.ticketFindUnique).toHaveBeenCalledWith({
      where: { code: 'ABC123' },
      include: {
        checkIns: true,
        order: {
          include: {
            session: { include: { listing: true } },
          },
        },
      },
    });
  });

  it('marks a ticket checked in only when it is still issued', async () => {
    mocks.ticketUpdateMany.mockResolvedValueOnce({ count: 1 });

    await expect(markTicketCheckedInIfIssued('ticket-1', new Date('2026-01-01T00:00:00Z'))).resolves.toBe(true);

    expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({
      where: { id: 'ticket-1', status: 'ISSUED' },
      data: { status: 'CHECKED_IN', checkedInAt: new Date('2026-01-01T00:00:00Z') },
    });
  });

  it('returns false when ticket was already consumed by concurrent scan', async () => {
    mocks.ticketUpdateMany.mockResolvedValueOnce({ count: 0 });

    await expect(markTicketCheckedInIfIssued('ticket-1')).resolves.toBe(false);
  });
});
