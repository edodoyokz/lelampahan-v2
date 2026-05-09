import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePartnerCapabilityStatus } from '@/data/partner';
import { recordAuditLog } from '@/data/audit';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  type: z.enum(['TOURS', 'EVENTS']),
  action: z.enum(['approve', 'reject']),
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
    const input = actionSchema.parse(body);
    const status = input.action === 'approve' ? 'APPROVED' : 'REJECTED';
    const capability = await updatePartnerCapabilityStatus(id, input.type, status);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: `partner.capability.${input.action}`,
      entityType: 'PartnerCapability',
      entityId: capability.id,
      metadata: { partnerId: id, type: input.type, status },
    });

    return NextResponse.json(capability);
  } catch (error) {
    return handleApiError(error);
  }
}
