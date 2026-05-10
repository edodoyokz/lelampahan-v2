import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  orderFindUnique: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    order: { findUnique: mocks.orderFindUnique },
  },
}));

import { findPendingPaymentOrderForUser } from '@/data/payment';

describe('findPendingPaymentOrderForUser', () => {
  it('fetches a pending payment order scoped to the authenticated user profile', async () => {
    mocks.orderFindUnique.mockResolvedValueOnce({
      id: 'order-1',
      userId: 'profile-1',
      orderNumber: 'LM-001',
      totalAmount: 100000,
      status: 'PENDING_PAYMENT',
    });

    await expect(findPendingPaymentOrderForUser('order-1', 'profile-1')).resolves.toEqual({
      id: 'order-1',
      userId: 'profile-1',
      orderNumber: 'LM-001',
      totalAmount: 100000,
      status: 'PENDING_PAYMENT',
    });

    expect(mocks.orderFindUnique).toHaveBeenCalledWith({
      where: { id: 'order-1', userId: 'profile-1', status: 'PENDING_PAYMENT' },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        userId: true,
        status: true,
      },
    });
  });
});
