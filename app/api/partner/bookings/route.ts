import { NextResponse } from 'next/server';
import { findOrdersByPartnerId } from '@/data/booking';
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const orders = await findOrdersByPartnerId(context.partner.id, status);

    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    return handleApiError(error);
  }
}
