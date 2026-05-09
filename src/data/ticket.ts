import { prisma } from '@/db/prisma';

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
    include: { checkIns: true },
  });
}

export async function findTicketsByOrder(orderId: string) {
  return prisma.ticket.findMany({
    where: { orderId },
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

export async function markTicketCheckedInDb(ticketId: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CHECKED_IN', checkedInAt: new Date() },
  });
}
