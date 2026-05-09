import { NextResponse } from 'next/server';
import { searchPublishedListingsInDb } from '@/data/listing';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const listings = await searchPublishedListingsInDb({ q, type });

    return NextResponse.json({
      query: q,
      filter: { type },
      listings,
      total: listings.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
