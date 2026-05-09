import { NextResponse } from 'next/server';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const context = await findPartnerContextByAuthUserId(auth.user.id);
    if (!context) {
      return NextResponse.json({ error: 'Partner membership not found' }, { status: 404 });
    }

    return NextResponse.json(context);
  } catch (error) {
    return handleApiError(error);
  }
}
