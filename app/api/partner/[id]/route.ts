import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;

  // Placeholder: will fetch from database in a later task
  return NextResponse.json({ id, name: 'Partner placeholder', status: 'PENDING_REVIEW' });
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Placeholder: will update database in a later task
  return NextResponse.json({ id, ...(body as object) });
}
