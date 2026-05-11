import { NextResponse } from 'next/server';
import { listListingsForPartner } from '@/data/listing';
import { requirePartnerOwnership } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const auth = await requirePartnerOwnership(request, id);
    if (auth.response) return auth.response;

    const listings = await listListingsForPartner(id);

    return NextResponse.json({ listings, total: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
}
