import { NextResponse } from 'next/server';
import { listPartners } from '@/data/partner';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const partners = await listPartners(status);

    return NextResponse.json({ partners, total: partners.length });
  } catch (error) {
    return handleApiError(error);
  }
}
