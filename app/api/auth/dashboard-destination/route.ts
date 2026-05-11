import { NextResponse } from 'next/server';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { getApiUser } from '@/lib/auth/api';
import { getUserRole } from '@/lib/auth/roles';
import { resolveDashboardDestination } from '@/lib/auth/destinations';

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getUserRole(user);
  const hasPartnerMembership =
    role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? false
      : Boolean(await findPartnerContextByAuthUserId(user.id));

  return NextResponse.json({
    destination: resolveDashboardDestination({ role, hasPartnerMembership }),
  });
}
