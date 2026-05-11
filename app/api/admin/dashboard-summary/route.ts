import { NextResponse } from 'next/server';
import { getAdminDashboardSummary } from '@/data/dashboard-summary';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const summary = await getAdminDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
