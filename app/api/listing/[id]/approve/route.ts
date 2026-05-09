import { NextResponse } from 'next/server';
import { z } from 'zod';
import { approveListing, rejectListing } from '@/domain/listing/service';
import { ListingData } from '@/domain/listing/service';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 422 });
  }

  // Placeholder: fetch listing from database
  const pendingListing: ListingData = {
    title: 'Sample',
    slug: 'sample',
    type: 'TOUR',
    description: 'A sample listing.',
    bookingMode: 'INSTANT_CONFIRMATION',
    partnerId: 'p1',
    timezone: 'Asia/Jakarta',
    status: 'PENDING_REVIEW',
  };

  try {
    const result =
      parsed.data.action === 'approve' ? approveListing(pendingListing) : rejectListing(pendingListing);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
