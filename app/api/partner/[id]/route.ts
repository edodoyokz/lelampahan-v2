import { NextResponse } from 'next/server';
import { findPartnerById } from '@/data/partner';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const partner = await findPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    return NextResponse.json(partner);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  return NextResponse.json({ id, ...(body as object) });
}
