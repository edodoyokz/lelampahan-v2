import { NextResponse } from 'next/server';
import { findListingById, updateListingInDb } from '@/data/listing';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { requireApiUser } from '@/lib/auth/api';
import { canAccessAdminRoute, getUserRole } from '@/lib/auth/roles';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const listing = await findListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const listing = await findListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const isAdmin = canAccessAdminRoute(getUserRole(auth.user));
    if (!isAdmin) {
      const partnerContext = await findPartnerContextByAuthUserId(auth.user.id);
      if (!partnerContext || partnerContext.partner.id !== listing.partnerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await updateListingInDb(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
