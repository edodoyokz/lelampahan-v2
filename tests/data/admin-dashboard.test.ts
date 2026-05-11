import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getAdminDashboardStats } from '@/data/admin-dashboard';

const partnerCount = vi.fn();
const listingCount = vi.fn();
const orderCount = vi.fn();
const orderAggregate = vi.fn();

vi.mock('@/db/prisma', () => ({
  prisma: {
    partner: { count: (...args: unknown[]) => partnerCount(...args) },
    listing: { count: (...args: unknown[]) => listingCount(...args) },
    order: {
      count: (...args: unknown[]) => orderCount(...args),
      aggregate: (...args: unknown[]) => orderAggregate(...args),
    },
  },
}));

describe('getAdminDashboardStats', () => {
  beforeEach(() => {
    partnerCount.mockReset();
    listingCount.mockReset();
    orderCount.mockReset();
    orderAggregate.mockReset();
  });

  it('returns aggregate counts for admin dashboard', async () => {
    partnerCount.mockResolvedValueOnce(10).mockResolvedValueOnce(2).mockResolvedValueOnce(7).mockResolvedValueOnce(1);
    listingCount.mockResolvedValueOnce(20).mockResolvedValueOnce(3).mockResolvedValueOnce(15).mockResolvedValueOnce(2);
    orderCount.mockResolvedValueOnce(30).mockResolvedValueOnce(4).mockResolvedValueOnce(12).mockResolvedValueOnce(8);
    orderAggregate.mockResolvedValueOnce({ _sum: { totalAmount: 1250000 } });

    await expect(getAdminDashboardStats()).resolves.toEqual({
      partners: { total: 10, pendingReview: 2, approved: 7, rejected: 1 },
      listings: { total: 20, pendingReview: 3, published: 15, rejected: 2 },
      orders: { total: 30, pendingPayment: 4, paid: 12, completed: 8, revenue: 1250000 },
    });
  });
});
