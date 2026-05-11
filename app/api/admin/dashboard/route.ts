import { NextResponse } from 'next/server';
import { getAdminDashboardStats } from '@/data/admin-dashboard';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const stats = await getAdminDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
