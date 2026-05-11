import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getPartnerDashboardStats } from '@/data/partner-dashboard';

const findUnique = vi.fn();
const listingCount = vi.fn();
const orderCount = vi.fn();
const orderAggregate = vi.fn();

vi.mock('@/db/prisma', () => ({
  prisma: {
    partner: { findUnique: (...args: unknown[]) => findUnique(...args) },
    listing: { count: (...args: unknown[]) => listingCount(...args) },
    order: {
      count: (...args: unknown[]) => orderCount(...args),
      aggregate: (...args: unknown[]) => orderAggregate(...args),
    },
  },
}));

describe('getPartnerDashboardStats', () => {
  beforeEach(() => {
    findUnique.mockReset();
    listingCount.mockReset();
    orderCount.mockReset();
    orderAggregate.mockReset();
  });

  it('returns partner dashboard aggregates', async () => {
    findUnique.mockResolvedValueOnce({ id: 'p1', name: 'Jogja Adventure', status: 'APPROVED' });
    listingCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1).mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    orderCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1).mockResolvedValueOnce(5).mockResolvedValueOnce(6);
    orderAggregate.mockResolvedValueOnce({ _sum: { totalAmount: 750000 } });

    await expect(getPartnerDashboardStats({ partnerId: 'p1', role: 'OWNER' })).resolves.toEqual({
      partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED', role: 'OWNER' },
      listings: { total: 4, draft: 1, pendingReview: 1, published: 2, rejected: 0 },
      bookings: { requested: 0, pendingPayment: 3, approved: 1, completed: 5, monthCount: 6 },
      revenue: { monthGross: 750000, estimatedPayout: 750000 },
    });
  });
});
