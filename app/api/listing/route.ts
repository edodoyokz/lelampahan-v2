import { NextResponse } from 'next/server';
import { listingSchema, TourListingInput } from '@/domain/listing/validation';
import { createListingDraft } from '@/domain/listing/service';

export async function GET() {
  // Placeholder: will return published listings from database
  return NextResponse.json({ listings: [], total: 0 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  const input = parsed.data as TourListingInput;
  const listing = createListingDraft({ input, existingSlugs: [] });

  return NextResponse.json(listing, { status: 201 });
}
