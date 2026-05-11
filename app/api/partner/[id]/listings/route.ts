import { NextResponse } from 'next/server';
import { listListingsForPartner } from '@/data/listing';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const { id } = await params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined;
    const pageSize = url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined;
    const { listings, total } = await listListingsForPartner(id, status, page, pageSize);

    return NextResponse.json({ listings, total });
  } catch (error) {
    return handleApiError(error);
  }
}
