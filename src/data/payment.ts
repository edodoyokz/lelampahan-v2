import { prisma } from '@/db/prisma';

export async function createPaymentRecord(data: {
  orderId: string;
  provider: string;
  method: string;
  amount: number;
  idempotencyKey: string;
  expiresAt: Date;
}) {
  return prisma.payment.create({
    data,
  });
}

export async function findPaymentByOrder(orderId: string) {
  return prisma.payment.findUnique({
    where: { orderId },
  });
}

export async function updatePaymentStatus(
  orderId: string,
  status: string,
  providerRef?: string,
  providerEventId?: string,
) {
  return prisma.payment.update({
    where: { orderId },
    data: {
      status: status as any,
      ...(providerRef ? { providerRef } : {}),
      ...(providerEventId ? { providerEventId } : {}),
    },
  });
}
