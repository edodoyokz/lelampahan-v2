import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/checkout/session?sessionId=X&ticketTypeId=Y
 * Returns session + ticket type + listing info needed for checkout display.
 * Public endpoint (no auth required) — only returns non-sensitive display data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get('sessionId');
    const ticketTypeId = searchParams.get('ticketTypeId');

    if (!sessionId || !ticketTypeId) {
      return NextResponse.json(
        { error: 'sessionId and ticketTypeId are required' },
        { status: 400 },
      );
    }

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        session: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!ticketType || ticketType.session.id !== sessionId) {
      return NextResponse.json(
        { error: 'Session or ticket type not found' },
        { status: 404 },
      );
    }

    const { session } = ticketType;

    return NextResponse.json({
      session: {
        id: session.id,
        startsAt: session.startsAt.toISOString(),
        capacity: session.capacity,
      },
      ticketType: {
        id: ticketType.id,
        name: ticketType.name,
        price: ticketType.price,
      },
      listing: session.listing,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
