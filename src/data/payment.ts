import { PaymentStatus } from '@prisma/client';
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
  status: PaymentStatus,
  providerRef?: string,
  providerEventId?: string,
  rawPayload?: unknown,
) {
  return prisma.payment.update({
    where: { orderId },
    data: {
      status,
      ...(providerRef ? { providerRef } : {}),
      ...(providerEventId ? { providerEventId } : {}),
      ...(rawPayload ? { rawPayload: rawPayload as object } : {}),
    },
  });
}
