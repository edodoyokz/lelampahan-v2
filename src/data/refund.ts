import { RefundRequestStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function createRefundRequest(input: {
  orderId: string;
  requestedByUserId: string;
  amount: number;
  reason: string;
}) {
  return prisma.refundRequest.create({
    data: {
      orderId: input.orderId,
      requestedByUserId: input.requestedByUserId,
      amount: input.amount,
      reason: input.reason,
      status: RefundRequestStatus.REQUESTED,
    },
  });
}

export async function findRefundRequestById(id: string) {
  return prisma.refundRequest.findUnique({
    where: { id },
    include: { order: true },
  });
}

export async function updateRefundRequestStatus(id: string, status: RefundRequestStatus) {
  return prisma.refundRequest.update({
    where: { id },
    data: { status },
  });
}

export async function listRefundRequests(status?: RefundRequestStatus) {
  return prisma.refundRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { session: { include: { listing: { select: { title: true } } } } } } },
  });
}
