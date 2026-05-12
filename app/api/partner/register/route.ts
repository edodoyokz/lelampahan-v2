import { NextResponse } from 'next/server';
import { partnerRegistrationSchema } from '@/domain/partner/validation';
import { createPartnerInDb, ensurePartnerOwnerMembership } from '@/data/partner';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';
import { sendPartnerRegistrationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = partnerRegistrationSchema.parse(body);
    const partner = await createPartnerInDb(input);
    await ensurePartnerOwnerMembership({
      authUserId: auth.user.id,
      email: auth.user.email ?? input.contactEmail,
      name:
        typeof auth.user.user_metadata?.name === 'string'
          ? auth.user.user_metadata.name
          : partner.name,
      partnerId: partner.id,
    });

    // Notify partner via email (fire-and-forget)
    sendPartnerRegistrationEmail({
      to: input.contactEmail,
      partnerName: partner.name,
      contactName:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : partner.name,
    }).catch(() => {/* non-fatal */});

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
