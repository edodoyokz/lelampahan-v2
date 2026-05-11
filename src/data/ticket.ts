import { prisma } from '@/db/prisma';

export async function findTicketsByUser(userId: string) {
  return prisma.ticket.findMany({
    where: { order: { userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          session: {
            include: {
              listing: { select: { title: true } },
            },
          },
          items: {
            include: {
              ticketType: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function createTicket(data: {
  orderId: string;
  code: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
}) {
  return prisma.ticket.create({
    data,
  });
}

export async function findTicketByCode(code: string) {
  return prisma.ticket.findUnique({
    where: { code },
    include: {
      checkIns: true,
      order: {
        include: {
          session: {
            include: {
              listing: true,
            },
          },
        },
      },
    },
  });
}

export async function findTicketsByOrder(orderId: string) {
  return prisma.ticket.findMany({
    where: { orderId },
  });
}

export async function findActiveTicketCountByUser(userId: string) {
  return prisma.ticket.count({
    where: {
      order: { userId },
      status: 'ISSUED',
    },
  });
}

export async function recordCheckIn(data: {
  ticketId: string;
  staffId: string;
  result: string;
}) {
  return prisma.checkIn.create({
    data: {
      ticketId: data.ticketId,
      staffId: data.staffId,
      result: data.result as any,
    },
  });
}

export async function markTicketCheckedInIfIssued(ticketId: string, checkedInAt = new Date()) {
  const result = await prisma.ticket.updateMany({
    where: { id: ticketId, status: 'ISSUED' },
    data: { status: 'CHECKED_IN', checkedInAt },
  });
  return result.count === 1;
}

export async function markTicketCheckedInDb(ticketId: string) {
  await markTicketCheckedInIfIssued(ticketId);
  return prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } });
}
