import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  orderCount: vi.fn(),
  orderAggregate: vi.fn(),
  ticketCount: vi.fn(),
  listingCount: vi.fn(),
  partnerCount: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    order: { count: mocks.orderCount, aggregate: mocks.orderAggregate },
    ticket: { count: mocks.ticketCount },
    listing: { count: mocks.listingCount },
    partner: { count: mocks.partnerCount },
  },
}));

import { getAdminDashboardSummary, getCustomerDashboardSummary, getPartnerDashboardSummary } from '@/data/dashboard-summary';

describe('dashboard summary data helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts customer orders, active tickets, and pending payments', async () => {
    mocks.orderCount.mockResolvedValueOnce(7).mockResolvedValueOnce(2);
    mocks.ticketCount.mockResolvedValueOnce(3);

    await expect(getCustomerDashboardSummary('profile-1')).resolves.toEqual({
      totalOrders: 7,
      activeTickets: 3,
      pendingPaymentOrders: 2,
    });

    expect(mocks.orderCount).toHaveBeenNthCalledWith(1, { where: { userId: 'profile-1' } });
    expect(mocks.ticketCount).toHaveBeenCalledWith({ where: { status: 'ISSUED', order: { userId: 'profile-1' } } });
    expect(mocks.orderCount).toHaveBeenNthCalledWith(2, { where: { userId: 'profile-1', status: 'PENDING_PAYMENT' } });
  });

  it('counts partner listing/order summary scoped to current month', async () => {
    mocks.listingCount.mockResolvedValueOnce(4).mockResolvedValueOnce(2);
    mocks.orderCount.mockResolvedValueOnce(1).mockResolvedValueOnce(3).mockResolvedValueOnce(5);
    mocks.orderAggregate.mockResolvedValueOnce({ _sum: { totalAmount: 125000 } });

    await expect(getPartnerDashboardSummary('partner-1', new Date('2026-05-11T12:00:00.000Z'))).resolves.toEqual({
      activeListings: 4,
      draftReviewListings: 2,
      requestedBookings: 1,
      pendingPaymentBookings: 3,
      monthlyPaidOrders: 5,
      estimatedMonthlyRevenue: 125000,
    });
  });

  it('counts admin platform summary and gross revenue', async () => {
    mocks.partnerCount.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
    mocks.listingCount.mockResolvedValueOnce(20).mockResolvedValueOnce(4);
    mocks.orderAggregate.mockResolvedValueOnce({ _sum: { totalAmount: 900000 } });

    await expect(getAdminDashboardSummary()).resolves.toEqual({
      totalPartners: 10,
      totalListings: 20,
      pendingPartnerReviews: 2,
      pendingListingReviews: 4,
      grossRevenue: 900000,
    });
  });
});
