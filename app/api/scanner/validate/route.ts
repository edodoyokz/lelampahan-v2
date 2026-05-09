import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTicketToken } from '@/domain/ticket/token';
import { env } from '@/config/env';

const scanSchema = z.object({
  token: z.string().min(1),
  staffId: z.string().min(1),
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 422 });
  }

  try {
    const decoded = verifyTicketToken(parsed.data.token, env.TICKET_TOKEN_SECRET);
    // Placeholder: validate ticket against database
    // Placeholder: check sessionId matches, ticket not already checked in
    return NextResponse.json({
      valid: true,
      result: 'VALID',
      ticketCode: decoded.ticketCode,
      ticketId: 'ticket-placeholder',
      sessionId: parsed.data.sessionId,
      checkedInAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ valid: false, result: 'INVALID_TICKET' }, { status: 200 });
  }
}
