import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRefundRequest, listRefundRequests } from '@/data/refund';
import { recordAuditLog } from '@/data/audit';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const refundSchema = z.object({
  orderId: z.string().min(1),
  requestedByUserId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().min(5),
});

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request);
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

    const body = await parseBody(request);
    const input = refundSchema.parse(body);
    const refund = await createRefundRequest(input);

    await recordAuditLog({
      actorUserId: input.requestedByUserId,
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
