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
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined;
    const pageSize = url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined;
    const q = url.searchParams.get('q') ?? undefined;
    const { listings, total } = await listListingsForAdmin(status, page, pageSize, q);

    return NextResponse.json({ listings, total });
  } catch (error) {
    return handleApiError(error);
  }
}
