import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { createListingImageUploadTarget } from '@/lib/r2';
import { requireApiUser } from '@/lib/auth/api';
import { DomainError } from '@/domain/shared/errors';
import { handleApiError, parseBody } from '@/lib/errors';

const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const context = await findPartnerContextByAuthUserId(auth.user.id);
    if (!context) {
      throw new DomainError('PARTNER_CONTEXT_REQUIRED', 'User is not linked to a partner');
    }

    const body = await parseBody(request);
    const input = uploadRequestSchema.parse(body);
    const target = await createListingImageUploadTarget(input);

    return NextResponse.json(target);
  } catch (error) {
    return handleApiError(error);
  }
}
