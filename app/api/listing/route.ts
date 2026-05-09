import { NextResponse } from 'next/server';
import { listingSchema } from '@/domain/listing/validation';
import { createListingInDb, listPublishedListings } from '@/data/listing';
import { handleApiError, parseBody } from '@/lib/errors';

export async function GET() {
  try {
    const listings = await listPublishedListings();
    return NextResponse.json({ listings, total: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = listingSchema.parse(body);
    const listing = await createListingInDb(input);
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
