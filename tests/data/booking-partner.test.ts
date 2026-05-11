import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  orderFindMany: vi.fn(),
  orderCount: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    order: { findMany: mocks.orderFindMany, count: mocks.orderCount },
  },
}));

import { findOrdersByPartnerId, getPartnerBookingSummary } from '@/data/booking';

describe('partner bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderCount.mockResolvedValue(0);
  });

  it('finds orders scoped to a partner through listing', async () => {
    mocks.orderFindMany.mockResolvedValueOnce([
      { id: 'o1', orderNumber: 'LM-001' },
      { id: 'o2', orderNumber: 'LM-002' },
    ]);
    mocks.orderCount.mockResolvedValueOnce(2);

    await expect(findOrdersByPartnerId('partner-1')).resolves.toEqual({
      orders: [
        { id: 'o1', orderNumber: 'LM-001' },
        { id: 'o2', orderNumber: 'LM-002' },
      ],
      total: 2,
    });

    expect(mocks.orderFindMany).toHaveBeenCalledWith({
      where: { session: { listing: { partnerId: 'partner-1' } } },
      include: {
        items: { include: { ticketType: true } },
        payment: true,
        participants: true,
        session: { include: { listing: true } },
        reservation: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: undefined,
      take: undefined,
    });
  });

  it('filters orders by status when provided', async () => {
    mocks.orderFindMany.mockResolvedValueOnce([]);
    mocks.orderCount.mockResolvedValueOnce(0);

    await expect(
      findOrdersByPartnerId('partner-1', 'PAID'),
    ).resolves.toEqual({ orders: [], total: 0 });

    expect(mocks.orderFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { session: { listing: { partnerId: 'partner-1' } }, status: 'PAID' },
      }),
    );
  });

  describe('getPartnerBookingSummary', () => {
    it('returns status counts for a partner', async () => {
      mocks.orderCount
        .mockResolvedValueOnce(3)  // pendingPayment
        .mockResolvedValueOnce(4)  // approved (PAID)
        .mockResolvedValueOnce(5); // completed

      await expect(getPartnerBookingSummary('partner-1')).resolves.toEqual({
        requested: 0,
        pendingPayment: 3,
        approved: 4,
        completed: 5,
      });

      expect(mocks.orderCount).toHaveBeenCalledWith({
        where: {
          session: { listing: { partnerId: 'partner-1' } },
          status: 'PENDING_PAYMENT',
        },
      });
      expect(mocks.orderCount).toHaveBeenCalledWith({
        where: {
          session: { listing: { partnerId: 'partner-1' } },
          status: 'PAID',
        },
      });
      expect(mocks.orderCount).toHaveBeenCalledWith({
        where: {
          session: { listing: { partnerId: 'partner-1' } },
          status: 'COMPLETED',
        },
      });
    });
  });
});
