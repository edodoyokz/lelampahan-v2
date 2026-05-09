import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/data/audit';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const { id } = await params;
    await recordAuditLog({
      actorUserId: auth.user.id,
      action: 'booking.partner_approved',
      entityType: 'BookingRequest',
      entityId: id,
    });

    return NextResponse.json({ id, status: 'PARTNER_APPROVED' });
  } catch (error) {
    return handleApiError(error);
  }
}
