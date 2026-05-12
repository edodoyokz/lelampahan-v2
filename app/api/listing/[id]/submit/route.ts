import { NextResponse } from 'next/server';
import { updateListingStatus } from '@/data/listing';
import { recordAuditLog } from '@/data/audit';
import { requireListingOwnership } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';
import { sendListingSubmittedEmail } from '@/lib/email';
import { prisma } from '@/db/prisma';

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

    // Notify partner via email (fire-and-forget)
    const partnerWithMember = await prisma.partner.findUnique({
      where: { id: listing.partnerId },
      include: {
        memberships: {
          include: { user: { select: { email: true, name: true } } },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    const ownerEmail = partnerWithMember?.memberships[0]?.user.email;
    if (ownerEmail) {
      sendListingSubmittedEmail({
        to: ownerEmail,
        partnerName: partnerWithMember?.name ?? 'Partner',
        listingTitle: listing.title,
      }).catch(() => {/* non-fatal */});
    }

    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}
