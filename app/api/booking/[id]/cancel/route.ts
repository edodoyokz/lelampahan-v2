import { NextResponse } from 'next/server';
import { cancelOrderAndReleaseReservation, findOrderById } from '@/data/booking';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { recordAuditLog } from '@/data/audit';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';
import { sendOrderCancelledEmail } from '@/lib/email';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const { id } = await params;

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

    // Fetch order details before cancelling so we can send email
    const orderBefore = await findOrderById(id);

    const cancelled = await cancelOrderAndReleaseReservation(id, profile.id);

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: 'order.cancelled_by_customer',
      entityType: 'Order',
      entityId: id,
      metadata: { orderNumber: cancelled.orderNumber },
    });

    // Send cancellation email (fire-and-forget)
    if (orderBefore?.participants[0]) {
      const participant = orderBefore.participants[0];
      sendOrderCancelledEmail({
        to: participant.email,
        participantName: participant.name,
        orderNumber: cancelled.orderNumber,
        listingTitle: orderBefore.session?.listing?.title ?? 'Lelampahan',
      }).catch(() => {/* non-fatal */});
    }

    return NextResponse.json({ id: cancelled.id, status: cancelled.status });
  } catch (error) {
    return handleApiError(error);
  }
}
