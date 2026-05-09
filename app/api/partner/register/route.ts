import { NextResponse } from 'next/server';
import { partnerRegistrationSchema } from '@/domain/partner/validation';
import { createPartnerInDb } from '@/data/partner';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = partnerRegistrationSchema.parse(body);
    const partner = await createPartnerInDb(input);
    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
