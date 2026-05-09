import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateListingStatus } from '@/data/listing';
import { recordAuditLog } from '@/data/audit';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  listingId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = actionSchema.parse(body);
    const status = input.action === 'approve' ? 'PUBLISHED' : 'REJECTED';
    const listing = await updateListingStatus(input.listingId, status);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: `listing.${input.action}`,
      entityType: 'Listing',
      entityId: input.listingId,
      metadata: { status },
    });

    return NextResponse.json({ listing, status, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
