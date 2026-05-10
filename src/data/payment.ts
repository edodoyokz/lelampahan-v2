import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function createPaymentRecord(data: {
  orderId: string;
  provider: string;
  method: string;
  amount: number;
  idempotencyKey: string;
  expiresAt: Date;
  providerRef?: string;
  rawPayload?: unknown;
}) {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: data.provider,
      method: data.method,
      amount: data.amount,
      idempotencyKey: data.idempotencyKey,
      expiresAt: data.expiresAt,
      ...(data.providerRef ? { providerRef: data.providerRef } : {}),
      ...(data.rawPayload ? { rawPayload: data.rawPayload as object } : {}),
    },
  });
}

export async function findPendingPaymentOrderForUser(orderId: string, userId: string) {
  return prisma.order.findUnique({
    where: { id: orderId, userId, status: OrderStatus.PENDING_PAYMENT },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      userId: true,
      status: true,
    },
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
