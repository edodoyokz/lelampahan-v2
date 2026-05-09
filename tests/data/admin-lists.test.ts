import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  partnerFindMany: vi.fn(),
  listingFindMany: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    partner: { findMany: mocks.partnerFindMany },
    listing: { findMany: mocks.listingFindMany },
  },
}));

import { listPartners } from '@/data/partner';
import { listListingsForAdmin, listListingsForPartner } from '@/data/listing';

describe('admin and partner list data', () => {
  it('lists partners with capabilities for admin review', async () => {
    mocks.partnerFindMany.mockResolvedValueOnce([{ id: 'p1', capabilities: [] }]);

    await expect(listPartners()).resolves.toEqual([{ id: 'p1', capabilities: [] }]);
    expect(mocks.partnerFindMany).toHaveBeenCalledWith({
      where: undefined,
      include: { capabilities: true, bankAccounts: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists listings with partner and session count for admin', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([{ id: 'l1', partner: { name: 'Partner' } }]);

    await expect(listListingsForAdmin()).resolves.toEqual([{ id: 'l1', partner: { name: 'Partner' } }]);
    expect(mocks.listingFindMany).toHaveBeenCalledWith({
      where: undefined,
      include: { partner: true, _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists listings scoped to a partner', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([{ id: 'l1', partnerId: 'p1' }]);

    await expect(listListingsForPartner('p1')).resolves.toEqual([{ id: 'l1', partnerId: 'p1' }]);
    expect(mocks.listingFindMany).toHaveBeenCalledWith({
      where: { partnerId: 'p1' },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });
});
