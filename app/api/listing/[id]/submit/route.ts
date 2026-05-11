import { NextResponse } from 'next/server';
import { updateListingStatus } from '@/data/listing';
import { recordAuditLog } from '@/data/audit';
import { requireListingOwnership } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const auth = await requireListingOwnership(request, id);
    if (auth.response) return auth.response;

    const listing = await updateListingStatus(id, 'PENDING_REVIEW');

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: 'listing.submitted',
      entityType: 'Listing',
      entityId: id,
      metadata: { status: 'PENDING_REVIEW' },
    });

    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}
