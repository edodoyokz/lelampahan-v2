import { NextResponse } from 'next/server';
import { partnerRegistrationSchema, PartnerRegistrationInput } from '@/domain/partner/validation';
import { createPartner } from '@/domain/partner/service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = partnerRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  const input = parsed.data as PartnerRegistrationInput;
  const partner = createPartner({ input });

  return NextResponse.json(partner, { status: 201 });
}
