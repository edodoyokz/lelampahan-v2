import { NextResponse } from 'next/server';
import { findTicketByCode, recordCheckIn, markTicketCheckedInIfIssued } from '@/data/ticket';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const partnerContext = await findPartnerContextByAuthUserId(auth.user.id);
    if (!partnerContext) {
      return NextResponse.json({ error: 'Partner membership not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { ticketCode } = body as { ticketCode?: string };

    if (!ticketCode || typeof ticketCode !== 'string') {
      return NextResponse.json({ error: 'Kode tiket wajib diisi' }, { status: 400 });
    }

    const ticket = await findTicketByCode(ticketCode.trim());

    if (!ticket) {
      return NextResponse.json({
        type: 'error',
        result: 'INVALID_TICKET',
        message: 'Tiket tidak ditemukan.',
      });
    }

    if (ticket.order.session.listing.partnerId !== partnerContext.partner.id) {
      await recordCheckIn({
        ticketId: ticket.id,
        staffId: auth.user.id,
        result: 'WRONG_SCOPE',
      });
      return NextResponse.json({
        type: 'error',
        result: 'WRONG_SCOPE',
        message: 'Tiket ini bukan untuk pengalaman milik partner Anda.',
      }, { status: 403 });
    }

    if (ticket.status === 'CHECKED_IN') {
      return NextResponse.json({
        type: 'error',
        result: 'ALREADY_CHECKED_IN',
        message: 'Tiket sudah pernah digunakan untuk check-in.',
        checkedInAt: ticket.checkedInAt?.toISOString(),
      });
    }

    if (ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED' || ticket.status === 'VOID') {
      return NextResponse.json({
        type: 'error',
        result: 'TICKET_UNAVAILABLE',
        message: `Tiket berstatus ${ticket.status} dan tidak dapat digunakan.`,
      });
    }

    const checkedInAt = new Date();
    const checkedIn = await markTicketCheckedInIfIssued(ticket.id, checkedInAt);
    if (!checkedIn) {
      return NextResponse.json({
        type: 'error',
        result: 'ALREADY_CHECKED_IN',
        message: 'Tiket sudah pernah digunakan untuk check-in.',
      });
    }

    // Record check-in after atomic ticket status transition succeeds.
    await recordCheckIn({
      ticketId: ticket.id,
      staffId: auth.user.id,
      result: 'VALID',
    });

    // Build response with ticket and order details
    const fullTicket = await findTicketByCode(ticketCode.trim());

    return NextResponse.json({
      type: 'success',
      result: 'VALID',
      ticketCode: ticket.code,
      ticketId: ticket.id,
      checkedInAt: checkedInAt.toISOString(),
      participantName: ticket.participantName,
      ticket: fullTicket,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
