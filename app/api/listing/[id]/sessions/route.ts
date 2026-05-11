import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findSessionsByListing, replaceListingSessions } from '@/data/session';
import { requireListingOwnership } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const auth = await requireListingOwnership(request, id);
    if (auth.response) return auth.response;

    const sessions = await findSessionsByListing(id);
    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    return handleApiError(error);
  }
}

const replaceSchema = z.object({
  sessions: z.array(
    z.object({
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
      capacity: z.number().int().min(1),
      bookingCutoff: z.string().datetime(),
      ticketTypes: z.array(
        z.object({
          name: z.string().min(1).max(100),
          price: z.number().int().min(0),
          quota: z.number().int().min(0).nullable().optional(),
        }),
      ),
    }),
  ),
});

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const auth = await requireListingOwnership(request, id);
    if (auth.response) return auth.response;
    const body = await parseBody(request);
    const input = replaceSchema.parse(body);

    await replaceListingSessions(
      id,
      input.sessions.map((session) => ({
        startsAt: new Date(session.startsAt),
        endsAt: new Date(session.endsAt),
        capacity: session.capacity,
        bookingCutoff: new Date(session.bookingCutoff),
        ticketTypes: session.ticketTypes.map((tt) => ({
          name: tt.name,
          price: tt.price,
          quota: tt.quota ?? undefined,
        })),
      })),
    );

    const sessions = await findSessionsByListing(id);
    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    return handleApiError(error);
  }
}
