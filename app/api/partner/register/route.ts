import { NextResponse } from 'next/server';
import { partnerRegistrationSchema } from '@/domain/partner/validation';
import { createPartnerInDb } from '@/data/partner';
import { handleApiError, parseBody } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = partnerRegistrationSchema.parse(body);
    const partner = await createPartnerInDb(input);
    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
