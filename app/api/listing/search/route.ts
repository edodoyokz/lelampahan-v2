import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const q = searchParams.get('q');

  // Placeholder: will query database with filters
  return NextResponse.json({
    query: q,
    filter: { type },
    listings: [],
    total: 0,
  });
}
