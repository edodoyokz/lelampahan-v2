import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateListingStatus } from '@/data/listing';
import { recordAuditLog } from '@/data/audit';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
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
    const status = input.action === 'approve' ? 'PUBLISHED' : 'REJECTED';
    const listing = await updateListingStatus(id, status);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: `listing.${input.action}`,
      entityType: 'Listing',
      entityId: id,
      metadata: { status },
    });

    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}
