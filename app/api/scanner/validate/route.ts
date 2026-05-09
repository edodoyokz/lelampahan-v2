import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTicketToken } from '@/domain/ticket/token';
import { env } from '@/config/env';
import { findTicketByCode, recordCheckIn, markTicketCheckedInDb } from '@/data/ticket';
import { handleApiError, parseBody } from '@/lib/errors';

const scanSchema = z.object({
  token: z.string().min(1),
  staffId: z.string().min(1),
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = scanSchema.parse(body);

    const decoded = verifyTicketToken(input.token, env.TICKET_TOKEN_SECRET);
    const ticket = await findTicketByCode(decoded.ticketCode);

    if (!ticket) {
      return NextResponse.json({ valid: false, result: 'INVALID_TICKET' });
    }

    if (ticket.status === 'CHECKED_IN') {
      return NextResponse.json({ valid: false, result: 'ALREADY_CHECKED_IN' });
    }

    await recordCheckIn({
      ticketId: ticket.id,
      staffId: input.staffId,
      result: 'VALID',
    });

    await markTicketCheckedInDb(ticket.id);

    return NextResponse.json({
      valid: true,
      result: 'VALID',
      ticketCode: decoded.ticketCode,
      ticketId: ticket.id,
      sessionId: input.sessionId,
      checkedInAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
