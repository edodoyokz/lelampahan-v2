import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';
import { findOrdersByUser } from '@/data/booking';
import { ensureUserProfileForAuthUser } from '@/data/user';

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;

  const profile = await ensureUserProfileForAuthUser({
    authUserId: user!.id,
    email: user!.email,
    name:
      typeof user!.user_metadata?.full_name === 'string'
        ? user!.user_metadata.full_name
        : typeof user!.user_metadata?.name === 'string'
          ? user!.user_metadata.name
          : null,
  });

  const orders = await findOrdersByUser(profile.id);

  return NextResponse.json({ orders });
}
