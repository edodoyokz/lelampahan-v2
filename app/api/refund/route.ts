import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRefundRequest, listRefundRequests } from '@/data/refund';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { updateOrderStatus } from '@/data/booking';
import { recordAuditLog } from '@/data/audit';
import { requireApiUser, requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';
import { DomainError } from '@/domain/shared/errors';
import { prisma } from '@/db/prisma';
import { OrderStatus } from '@prisma/client';

const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().min(5),
});

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const refunds = await listRefundRequests();
    return NextResponse.json(refunds);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const profile = await ensureUserProfileForAuthUser({
      authUserId: auth.user.id,
      email: auth.user.email,
      name:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : typeof auth.user.user_metadata?.name === 'string'
            ? auth.user.user_metadata.name
            : null,
    });

    const body = await parseBody(request);
    const input = refundSchema.parse(body);

    // Verify the order belongs to this user and is in a refundable state
    const order = await prisma.order.findUnique({
      where: { id: input.orderId, userId: profile.id },
      select: { id: true, status: true, totalAmount: true },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    const refundableStatuses: OrderStatus[] = [OrderStatus.PAID, OrderStatus.COMPLETED];
    if (!refundableStatuses.includes(order.status)) {
      throw new DomainError(
        'ORDER_NOT_REFUNDABLE',
        'Only paid or completed orders can be refunded',
      );
    }

    if (input.amount > order.totalAmount) {
      throw new DomainError('REFUND_AMOUNT_EXCEEDS_ORDER', 'Refund amount exceeds order total');
    }

    // Prevent duplicate refund requests for the same order
    const existingRefund = await prisma.refundRequest.findFirst({
      where: { orderId: input.orderId, status: { in: ['REQUESTED', 'APPROVED'] } },
    });
    if (existingRefund) {
      throw new DomainError('REFUND_ALREADY_EXISTS', 'A refund request for this order already exists');
    }

    const refund = await createRefundRequest({
      orderId: input.orderId,
      requestedByUserId: profile.id,
      amount: input.amount,
      reason: input.reason,
    });

    // Transition order to REFUND_REQUESTED
    await updateOrderStatus(input.orderId, OrderStatus.REFUND_REQUESTED);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: 'refund.requested',
      entityType: 'RefundRequest',
      entityId: refund.id,
      metadata: { orderId: input.orderId, amount: input.amount },
    });

    return NextResponse.json(refund, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
