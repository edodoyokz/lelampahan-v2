import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  partnerFindMany: vi.fn(),
  partnerCount: vi.fn(),
  listingFindMany: vi.fn(),
  listingCount: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    partner: { findMany: mocks.partnerFindMany, count: mocks.partnerCount },
    listing: { findMany: mocks.listingFindMany, count: mocks.listingCount },
  },
}));

import { listPartners } from '@/data/partner';
import { listListingsForAdmin, listListingsForPartner } from '@/data/listing';

describe('admin and partner list data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.partnerCount.mockResolvedValue(0);
    mocks.listingCount.mockResolvedValue(0);
  });

  it('lists partners with capabilities for admin review', async () => {
    mocks.partnerFindMany.mockResolvedValueOnce([{ id: 'p1', capabilities: [] }]);
    mocks.partnerCount.mockResolvedValueOnce(1);

    await expect(listPartners()).resolves.toEqual({ partners: [{ id: 'p1', capabilities: [] }], total: 1 });
    expect(mocks.partnerFindMany).toHaveBeenCalledWith({
      where: undefined,
      include: { capabilities: true, bankAccounts: true },
      orderBy: { createdAt: 'desc' },
      skip: undefined,
      take: undefined,
    });
  });

  it('searches partners by name server-side', async () => {
    mocks.partnerFindMany.mockResolvedValueOnce([]);
    mocks.partnerCount.mockResolvedValueOnce(0);

    await listPartners(undefined, 2, 10, 'Kota');

    expect(mocks.partnerFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { contains: 'Kota', mode: 'insensitive' } },
        skip: 10,
        take: 10,
      }),
    );
    expect(mocks.partnerCount).toHaveBeenCalledWith({
      where: { name: { contains: 'Kota', mode: 'insensitive' } },
    });
  });

  it('lists listings with partner and session count for admin', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([{ id: 'l1', partner: { name: 'Partner' } }]);
    mocks.listingCount.mockResolvedValueOnce(1);

    await expect(listListingsForAdmin()).resolves.toEqual({ listings: [{ id: 'l1', partner: { name: 'Partner' } }], total: 1 });
    expect(mocks.listingFindMany).toHaveBeenCalledWith({
      where: undefined,
      include: { partner: true, _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
      skip: undefined,
      take: undefined,
    });
  });

  it('searches admin listings by title server-side', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([]);
    mocks.listingCount.mockResolvedValueOnce(0);

    await listListingsForAdmin('PENDING_REVIEW', 1, 20, 'Heritage');

    expect(mocks.listingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PENDING_REVIEW',
          title: { contains: 'Heritage', mode: 'insensitive' },
        },
        skip: 0,
        take: 20,
      }),
    );
  });

  it('lists listings scoped to a partner', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([{ id: 'l1', partnerId: 'p1' }]);
    mocks.listingCount.mockResolvedValueOnce(1);

    await expect(listListingsForPartner('p1')).resolves.toEqual({ listings: [{ id: 'l1', partnerId: 'p1' }], total: 1 });
    expect(mocks.listingFindMany).toHaveBeenCalledWith({
      where: { partnerId: 'p1' },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
      skip: undefined,
      take: undefined,
    });
  });
});
