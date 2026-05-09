import { OrderStatus, Prisma, ReservationStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';
import { DomainError } from '@/domain/shared/errors';
import { ensureCapacityAvailable } from '@/domain/booking/reservation-policy';

export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  sessionId: string;
  totalAmount: number;
  status?: string;
  items: Array<{ ticketTypeId: string; quantity: number; unitPrice: number; subtotal: number }>;
}) {
  return prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      userId: data.userId,
      sessionId: data.sessionId,
      totalAmount: data.totalAmount,
      status: (data.status || OrderStatus.DRAFT) as OrderStatus,
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  });
}

export async function createReservedOrder(data: {
  orderNumber: string;
  userId: string;
  sessionId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  participants: Array<{ name: string; email: string; phone: string }>;
  expiresAt: Date;
  now?: Date;
}) {
  if (data.participants.length !== data.quantity) {
    throw new DomainError(
      'PARTICIPANT_COUNT_MISMATCH',
      'Participant count must match ticket quantity',
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: data.sessionId },
        include: { ticketTypes: { where: { id: data.ticketTypeId } } },
      });

      if (!session) {
        throw new DomainError('SESSION_NOT_FOUND', 'Session not found');
      }

      const ticketType = session.ticketTypes[0];
      if (!ticketType || !ticketType.active) {
        throw new DomainError('TICKET_TYPE_NOT_FOUND', 'Ticket type not found');
      }

      const now = data.now ?? new Date();
      const activeReservationQuantity = await tx.reservation.aggregate({
        where: {
          sessionId: data.sessionId,
          ticketTypeId: data.ticketTypeId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: now },
        },
        _sum: { quantity: true },
      });

      const soldQuantity = await tx.orderItem.aggregate({
        where: {
          ticketTypeId: data.ticketTypeId,
          order: {
            sessionId: data.sessionId,
            status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
          },
        },
        _sum: { quantity: true },
      });

      ensureCapacityAvailable({
        capacity: session.capacity,
        soldQuantity: soldQuantity._sum.quantity ?? 0,
        activeReservedQuantity: activeReservationQuantity._sum.quantity ?? 0,
        requestedQuantity: data.quantity,
      });

      if (ticketType.quota !== null) {
        ensureCapacityAvailable({
          capacity: ticketType.quota,
          soldQuantity: soldQuantity._sum.quantity ?? 0,
          activeReservedQuantity: activeReservationQuantity._sum.quantity ?? 0,
          requestedQuantity: data.quantity,
        });
      }

      const reservation = await tx.reservation.create({
        data: {
          sessionId: data.sessionId,
          ticketTypeId: data.ticketTypeId,
          quantity: data.quantity,
          status: ReservationStatus.ACTIVE,
          expiresAt: data.expiresAt,
        },
      });

      return tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          userId: data.userId,
          sessionId: data.sessionId,
          reservationId: reservation.id,
          totalAmount: data.totalAmount,
          expiresAt: data.expiresAt,
          status: OrderStatus.PENDING_PAYMENT,
          items: {
            create: [
              {
                ticketTypeId: data.ticketTypeId,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                subtotal: data.totalAmount,
              },
            ],
          },
          participants: {
            create: data.participants.map((participant) => ({
              name: participant.name,
              email: participant.email,
              phone: participant.phone,
            })),
          },
        },
        include: { items: true, participants: true, reservation: true },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
      tickets: true,
      participants: true,
      session: { include: { listing: true } },
      reservation: true,
    },
  });
}

export async function findOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, payment: true, tickets: true },
  });
}

export async function findOrdersByPartnerId(partnerId: string, status?: string) {
  return prisma.order.findMany({
    where: {
      session: { listing: { partnerId } },
      ...(status ? { status: status as OrderStatus } : {}),
    },
    include: {
      items: { include: { ticketType: true } },
      payment: true,
      participants: true,
      session: { include: { listing: true } },
      reservation: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function expireStaleReservations(now: Date = new Date()) {
  return prisma.reservation.updateMany({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lte: now },
    },
    data: { status: ReservationStatus.EXPIRED },
  });
}

export async function markOrderPaidAndConsumeReservation(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { reservation: true, session: { include: { listing: true } } },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    if (order.reservation?.status === ReservationStatus.ACTIVE) {
      await tx.reservation.update({
        where: { id: order.reservation.id },
        data: { status: ReservationStatus.CONSUMED },
      });
    }

    const paidOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });

    return { ...paidOrder, partnerId: order.session.listing.partnerId };
  });
}
