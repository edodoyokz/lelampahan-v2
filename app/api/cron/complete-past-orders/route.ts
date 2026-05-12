import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { OrderStatus } from '@prisma/client';
import { recordAuditLog } from '@/data/audit';
import { env } from '@/config/env';
import { handleApiError } from '@/lib/errors';

/**
 * Marks PAID orders as COMPLETED when their session has ended.
 * Should run periodically (e.g. every hour).
 */
async function runCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.order.updateMany({
    where: {
      status: OrderStatus.PAID,
      session: {
        endsAt: { lte: now },
      },
    },
    data: { status: OrderStatus.COMPLETED },
  });

  await recordAuditLog({
    action: 'order.complete_past',
    entityType: 'Order',
    entityId: 'batch',
    metadata: { count: result.count },
  });

  return NextResponse.json({
    ordersCompleted: result.count,
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
