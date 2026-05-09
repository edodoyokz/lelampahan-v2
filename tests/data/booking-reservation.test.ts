import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  sessionFindUniqueMock: vi.fn(),
  reservationAggregateMock: vi.fn(),
  orderItemAggregateMock: vi.fn(),
  reservationCreateMock: vi.fn(),
  orderCreateMock: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    $transaction: mocks.transactionMock,
  },
}));

vi.mock('@prisma/client', () => ({
  OrderStatus: {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
  },
  ReservationStatus: {
    ACTIVE: 'ACTIVE',
    CONSUMED: 'CONSUMED',
    EXPIRED: 'EXPIRED',
    RELEASED: 'RELEASED',
  },
  Prisma: {
    TransactionIsolationLevel: {
      Serializable: 'Serializable',
    },
  },
}));

import { createReservedOrder } from '@/data/booking';

describe('createReservedOrder', () => {
  it('creates a reservation and order in a serializable transaction', async () => {
    const tx = {
      session: { findUnique: mocks.sessionFindUniqueMock },
      reservation: {
        aggregate: mocks.reservationAggregateMock,
        create: mocks.reservationCreateMock,
      },
      orderItem: { aggregate: mocks.orderItemAggregateMock },
      order: { create: mocks.orderCreateMock },
    };

    mocks.transactionMock.mockImplementation(async (callback) => callback(tx));
    mocks.sessionFindUniqueMock.mockResolvedValue({
      id: 'session-1',
      capacity: 10,
      ticketTypes: [{ id: 'ticket-type-1', quota: 4, active: true }],
    });
    mocks.reservationAggregateMock.mockResolvedValue({ _sum: { quantity: 1 } });
    mocks.orderItemAggregateMock.mockResolvedValue({ _sum: { quantity: 1 } });
    mocks.reservationCreateMock.mockResolvedValue({ id: 'reservation-1' });
    mocks.orderCreateMock.mockResolvedValue({ id: 'order-1', reservationId: 'reservation-1' });

    const result = await createReservedOrder({
      orderNumber: 'LM-20260509-ABCD',
      userId: 'user-1',
      sessionId: 'session-1',
      ticketTypeId: 'ticket-type-1',
      quantity: 2,
      unitPrice: 50000,
      totalAmount: 100000,
      participants: [
        { name: 'Budi', email: 'budi@example.com', phone: '0811' },
        { name: 'Siti', email: 'siti@example.com', phone: '0812' },
      ],
      expiresAt: new Date('2026-05-09T10:30:00.000Z'),
      now: new Date('2026-05-09T10:00:00.000Z'),
    });

    expect(result).toEqual({ id: 'order-1', reservationId: 'reservation-1' });
    expect(mocks.transactionMock).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
    expect(mocks.reservationCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sessionId: 'session-1',
        ticketTypeId: 'ticket-type-1',
        quantity: 2,
        status: 'ACTIVE',
      }),
    });
    expect(mocks.orderCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reservationId: 'reservation-1',
        status: 'PENDING_PAYMENT',
      }),
      include: { items: true, participants: true, reservation: true },
    });
  });

  it('rejects when session capacity is exhausted', async () => {
    const tx = {
      session: { findUnique: mocks.sessionFindUniqueMock },
      reservation: {
        aggregate: mocks.reservationAggregateMock,
        create: mocks.reservationCreateMock,
      },
      orderItem: { aggregate: mocks.orderItemAggregateMock },
      order: { create: mocks.orderCreateMock },
    };

    mocks.transactionMock.mockImplementation(async (callback) => callback(tx));
    mocks.sessionFindUniqueMock.mockResolvedValue({
      id: 'session-1',
      capacity: 2,
      ticketTypes: [{ id: 'ticket-type-1', quota: null, active: true }],
    });
    mocks.reservationAggregateMock.mockResolvedValue({ _sum: { quantity: 1 } });
    mocks.orderItemAggregateMock.mockResolvedValue({ _sum: { quantity: 1 } });

    await expect(
      createReservedOrder({
        orderNumber: 'LM-20260509-ABCD',
        userId: 'user-1',
        sessionId: 'session-1',
        ticketTypeId: 'ticket-type-1',
        quantity: 1,
        unitPrice: 50000,
        totalAmount: 50000,
        participants: [{ name: 'Budi', email: 'budi@example.com', phone: '0811' }],
        expiresAt: new Date('2026-05-09T10:30:00.000Z'),
        now: new Date('2026-05-09T10:00:00.000Z'),
      }),
    ).rejects.toThrow('Not enough capacity available');
  });
});
