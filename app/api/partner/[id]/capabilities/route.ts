import { NextResponse } from 'next/server';
import { z } from 'zod';

const actionSchema = z.object({
  type: z.enum(['TOURS', 'EVENTS']),
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
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 422 });
  }

  return NextResponse.json({
    partnerId: id,
    type: parsed.data.type,
    status: parsed.data.action === 'approve' ? 'APPROVED' : 'REJECTED',
  });
}
