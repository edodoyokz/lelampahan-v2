import { prisma } from '@/db/prisma';

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
      status: (data.status || 'DRAFT') as any,
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  });
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, tickets: true },
  });
}

export async function findOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, payment: true, tickets: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({
    where: { id },
    data: { status: status as any },
  });
}
