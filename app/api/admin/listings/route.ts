import { NextResponse } from 'next/server';
import { listListingsForAdmin } from '@/data/listing';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const listings = await listListingsForAdmin(status);

    return NextResponse.json({ listings, total: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
}
