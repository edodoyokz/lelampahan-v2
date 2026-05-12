import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';
import { DomainError } from '@/domain/shared/errors';

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

/**
 * Upsert payment record: if a previous EXPIRED or FAILED payment exists for this
 * order, replace it so the customer can retry without hitting the unique constraint.
 * Wrapped in a transaction to prevent race conditions from concurrent retries.
 */
export async function upsertPaymentRecord(data: {
  orderId: string;
  provider: string;
  method: string;
  amount: number;
  idempotencyKey: string;
  expiresAt: Date;
  providerRef?: string;
  rawPayload?: unknown;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { orderId: data.orderId } });

    if (existing) {
      const retryableStatuses: PaymentStatus[] = [PaymentStatus.EXPIRED, PaymentStatus.FAILED];
      if (!retryableStatuses.includes(existing.status)) {
        throw new DomainError(
          'PAYMENT_NOT_RETRYABLE',
          `Cannot replace payment in status ${existing.status}`,
        );
      }
      // Delete the stale record so we can create a fresh one with a new idempotency key
      await tx.payment.delete({ where: { orderId: data.orderId } });
    }

    return tx.payment.create({
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
