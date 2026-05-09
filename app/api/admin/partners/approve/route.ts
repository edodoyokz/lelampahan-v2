import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePartnerCapabilityStatus, updatePartnerStatus } from '@/data/partner';
import { recordAuditLog } from '@/data/audit';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  partnerId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  type: z.enum(['TOURS', 'EVENTS']).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = actionSchema.parse(body);
    const status = input.action === 'approve' ? 'APPROVED' : 'REJECTED';
    const result = input.type
      ? await updatePartnerCapabilityStatus(input.partnerId, input.type, status)
      : await updatePartnerStatus(input.partnerId, status);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: input.type ? `partner.capability.${input.action}` : `partner.${input.action}`,
      entityType: input.type ? 'PartnerCapability' : 'Partner',
      entityId: input.partnerId,
      metadata: { type: input.type, status },
    });

    return NextResponse.json({ result, status, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
