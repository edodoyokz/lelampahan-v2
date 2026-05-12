import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateRefundRequestStatus, findRefundRequestById } from '@/data/refund';
import { updateOrderStatus } from '@/data/booking';
import { recordAuditLog } from '@/data/audit';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';
import { DomainError } from '@/domain/shared/errors';

const decisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: z.string().max(1000).optional(),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const { id } = await params;
    const body = await parseBody(request);
    const input = decisionSchema.parse(body);

    const refund = await findRefundRequestById(id);
    if (!refund) {
      throw new DomainError('REFUND_NOT_FOUND', 'Refund request not found');
    }

    if (refund.status !== 'REQUESTED') {
      throw new DomainError(
        'REFUND_ALREADY_PROCESSED',
        `Refund request is already in status ${refund.status}`,
      );
    }

    const newRefundStatus = input.decision === 'approve' ? 'APPROVED' : 'REJECTED';
    await updateRefundRequestStatus(id, newRefundStatus as Parameters<typeof updateRefundRequestStatus>[1]);

    // Update order status to reflect refund decision
    if (input.decision === 'approve') {
      await updateOrderStatus(refund.orderId, 'REFUNDED' as Parameters<typeof updateOrderStatus>[1]);
    } else {
      // Move order back to REFUND_REJECTED so it's not stuck in REFUND_REQUESTED
      await updateOrderStatus(refund.orderId, 'REFUND_REJECTED' as Parameters<typeof updateOrderStatus>[1]);
    }

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: input.decision === 'approve' ? 'refund.approved' : 'refund.rejected',
      entityType: 'RefundRequest',
      entityId: id,
      metadata: {
        orderId: refund.orderId,
        amount: refund.amount,
        note: input.note,
      },
    });

    return NextResponse.json({ id, status: newRefundStatus });
  } catch (error) {
    return handleApiError(error);
  }
}
