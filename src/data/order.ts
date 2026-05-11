import { prisma } from '@/db/prisma';

export async function findOrderCountByUser(userId: string) {
  return prisma.order.count({
    where: { userId },
  });
}

export async function findPendingPaymentOrderCountByUser(userId: string) {
  return prisma.order.count({
    where: {
      userId,
      status: 'PENDING_PAYMENT',
    },
  });
}
