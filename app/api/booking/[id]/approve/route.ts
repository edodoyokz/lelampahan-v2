import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  // Placeholder: fetch booking, call approveBookingRequest from domain service
  return NextResponse.json({ id, status: 'PARTNER_APPROVED' });
}
