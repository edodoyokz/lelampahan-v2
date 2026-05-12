import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findPartnerById } from '@/data/partner';
import { requireApiPartnerContext, requireApiAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';
import { DomainError } from '@/domain/shared/errors';
import { prisma } from '@/db/prisma';

const partnerUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    // Require either partner membership or admin access — bank account data is sensitive
    const partnerAuth = await requireApiPartnerContext(request);
    const adminAuth = partnerAuth.response ? await requireApiAdmin(request) : null;
    if (partnerAuth.response && adminAuth?.response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const partner = await findPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Strip bank account details unless the requester is the partner owner or admin
    const isOwner = !partnerAuth.response && partnerAuth.context?.partner.id === id;
    const isAdmin = adminAuth && !adminAuth.response;
    if (!isOwner && !isAdmin) {
      const { bankAccounts: _bank, ...safePartner } = partner;
      void _bank;
      return NextResponse.json(safePartner);
    }

    return NextResponse.json(partner);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await requireApiPartnerContext(request);
    if (auth.response) return auth.response;

    const { id } = await params;

    // Only the partner's own members can update their profile
    if (auth.context!.partner.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await parseBody(request);
    const input = partnerUpdateSchema.parse(body);

    if (Object.keys(input).length === 0) {
      throw new DomainError('NO_FIELDS_TO_UPDATE', 'No fields provided for update');
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
