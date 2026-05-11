import { NextResponse } from 'next/server';
import { getPartnerDashboardSummary } from '@/data/dashboard-summary';
import { requireApiPartnerContext } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPartnerContext(request);
    if (auth.response) return auth.response;

    const summary = await getPartnerDashboardSummary(auth.context.partner.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
