import { NextResponse } from 'next/server';
import { expireStaleReservations, expireOrdersWithExpiredReservations } from '@/data/booking';
import { recordAuditLog } from '@/data/audit';
import { env } from '@/config/env';
import { handleApiError } from '@/lib/errors';
import { sendOrderExpiredEmail } from '@/lib/email';
import { prisma } from '@/db/prisma';
import { OrderStatus } from '@prisma/client';

async function runCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Step 1: expire stale reservations
  const reservationResult = await expireStaleReservations(now);

  // Step 2: find orders that will be expired (before updating) so we can notify
  const ordersToExpire = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING_PAYMENT,
      reservation: {
        status: 'EXPIRED',
        expiresAt: { lte: now },
      },
    },
    include: {
      participants: { take: 1 },
      session: { include: { listing: { select: { title: true } } } },
    },
  });

  // Step 3: expire orders whose reservation has expired
  const orderResult = await expireOrdersWithExpiredReservations(now);

  // Step 4: send expiry emails (fire-and-forget, don't fail cron on email error)
  const emailPromises = ordersToExpire.map(async (order) => {
    const participant = order.participants[0];
    if (!participant) return;
    try {
      await sendOrderExpiredEmail({
        to: participant.email,
        participantName: participant.name,
        orderNumber: order.orderNumber,
        listingTitle: order.session.listing.title,
      });
    } catch {
      // non-fatal
    }
  });
  await Promise.allSettled(emailPromises);

  await recordAuditLog({
    action: 'reservation.expire_stale',
    entityType: 'Reservation',
    entityId: 'batch',
    metadata: {
      reservationsExpired: reservationResult.count,
      ordersExpired: orderResult.count,
    },
  });

  return NextResponse.json({
    reservationsExpired: reservationResult.count,
    ordersExpired: orderResult.count,
    timestamp: now.toISOString(),
  });
}

// Vercel Cron invokes via GET; POST is kept for manual/external triggers
export async function GET(request: Request) {
  try {
    return await runCron(request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await runCron(request);
  } catch (error) {
    return handleApiError(error);
  }
}
