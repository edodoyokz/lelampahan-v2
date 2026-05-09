import { NextResponse } from 'next/server';
import { submitListingForReview } from '@/domain/listing/service';
import { ListingData } from '@/domain/listing/service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;

  // Placeholder: fetch listing from database, then call domain service
  const draftListing: ListingData = {
    title: 'Sample',
    slug: 'sample',
    type: 'TOUR',
    description: 'A sample listing.',
    bookingMode: 'INSTANT_CONFIRMATION',
    partnerId: 'p1',
    timezone: 'Asia/Jakarta',
    status: 'DRAFT',
  };

  try {
    const submitted = submitListingForReview(draftListing);
    return NextResponse.json(submitted);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
