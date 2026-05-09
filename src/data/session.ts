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
