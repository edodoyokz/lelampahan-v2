import { OrderStatus, ReservationStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function createSession(data: {
  listingId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  bookingCutoff: Date;
}) {
  return prisma.session.create({
    data,
  });
}

export async function createTicketType(data: {
  sessionId: string;
  name: string;
  price: number;
  quota?: number;
}) {
  return prisma.ticketType.create({
    data,
  });
}

export async function findSessionsByListing(listingId: string) {
  return prisma.session.findMany({
    where: { listingId },
    include: { ticketTypes: true },
    orderBy: { startsAt: 'asc' },
  });
}

export async function computeSessionRemainingCapacity(sessionId: string): Promise<number> {
  const now = new Date();

  const [session, activeReserved, sold] = await Promise.all([
    prisma.session.findUnique({
      where: { id: sessionId },
      select: { capacity: true },
    }),
    prisma.reservation.aggregate({
      where: {
        sessionId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      _sum: { quantity: true },
    }),
    prisma.orderItem.aggregate({
      where: {
        order: {
          sessionId,
          status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
        },
      },
      _sum: { quantity: true },
    }),
  ]);

  if (!session) return 0;

  const soldQuantity = sold._sum.quantity ?? 0;
  const reservedQuantity = activeReserved._sum.quantity ?? 0;

  return Math.max(0, session.capacity - soldQuantity - reservedQuantity);
}

export async function replaceListingSessions(
  listingId: string,
  sessions: Array<{
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    bookingCutoff: Date;
    ticketTypes: Array<{ name: string; price: number; quota?: number }>;
  }>,
) {
  await prisma.session.deleteMany({ where: { listingId } });

  for (const sessionData of sessions) {
    const session = await prisma.session.create({
      data: {
        listingId,
        startsAt: sessionData.startsAt,
        endsAt: sessionData.endsAt,
        capacity: sessionData.capacity,
        bookingCutoff: sessionData.bookingCutoff,
      },
    });

    for (const ticketType of sessionData.ticketTypes) {
      await prisma.ticketType.create({
        data: {
          sessionId: session.id,
          name: ticketType.name,
          price: ticketType.price,
          quota: ticketType.quota ?? null,
        },
      });
    }
  }
}
