import { NextResponse } from 'next/server';
import { expireStaleReservations } from '@/data/booking';
import { recordAuditLog } from '@/data/audit';
import { env } from '@/config/env';
import { handleApiError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await expireStaleReservations();
    await recordAuditLog({
      action: 'reservation.expire_stale',
      entityType: 'Reservation',
      entityId: 'batch',
      metadata: { count: result.count },
    });

    return NextResponse.json({ expired: result.count, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
