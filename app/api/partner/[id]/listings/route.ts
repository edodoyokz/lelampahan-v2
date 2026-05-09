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
    const listings = await listListingsForPartner(id);

    return NextResponse.json({ listings, total: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
}
