import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listingFindMany: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    listing: { findMany: mocks.listingFindMany },
  },
}));

import { searchPublishedListingsInDb } from '@/data/listing';

describe('search published listings in db', () => {
  it('filters published listings by query and type', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([{ id: 'l1', title: 'Workshop Batik' }]);

    await expect(searchPublishedListingsInDb({ q: 'batik', type: 'EVENT' })).resolves.toEqual([
      { id: 'l1', title: 'Workshop Batik' },
    ]);

    expect(mocks.listingFindMany).toHaveBeenCalledWith({
      where: {
        status: 'PUBLISHED',
        type: 'EVENT',
        OR: [
          { title: { contains: 'batik', mode: 'insensitive' } },
          { description: { contains: 'batik', mode: 'insensitive' } },
        ],
      },
      include: {
        partner: true,
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        sessions: { where: { status: 'PUBLISHED' }, include: { ticketTypes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
