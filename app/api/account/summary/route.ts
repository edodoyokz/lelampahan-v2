import { NextResponse } from 'next/server';
import { getCustomerDashboardSummary } from '@/data/dashboard-summary';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const profile = await ensureUserProfileForAuthUser({
      authUserId: auth.user.id,
      email: auth.user.email,
      name:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : typeof auth.user.user_metadata?.name === 'string'
            ? auth.user.user_metadata.name
            : null,
    });

    const summary = await getCustomerDashboardSummary(profile.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
