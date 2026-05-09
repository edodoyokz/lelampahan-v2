import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  orderFindMany: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    order: { findMany: mocks.orderFindMany },
  },
}));

import { findOrdersByPartnerId } from '@/data/booking';

describe('partner bookings', () => {
  it('finds orders scoped to a partner through listing', async () => {
    mocks.orderFindMany.mockResolvedValueOnce([
      { id: 'o1', orderNumber: 'LM-001' },
      { id: 'o2', orderNumber: 'LM-002' },
    ]);

    await expect(findOrdersByPartnerId('partner-1')).resolves.toEqual([
      { id: 'o1', orderNumber: 'LM-001' },
      { id: 'o2', orderNumber: 'LM-002' },
    ]);

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
    });
  });

  it('filters orders by status when provided', async () => {
    mocks.orderFindMany.mockResolvedValueOnce([]);

    await expect(
      findOrdersByPartnerId('partner-1', 'PAID'),
    ).resolves.toEqual([]);

    expect(mocks.orderFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { session: { listing: { partnerId: 'partner-1' } }, status: 'PAID' },
      }),
    );
  });
});
