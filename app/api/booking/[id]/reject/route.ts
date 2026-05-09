import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  // Placeholder: fetch booking, call rejectBookingRequest from domain service
  return NextResponse.json({ id, status: 'PARTNER_REJECTED' });
}
