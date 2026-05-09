import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSettlement, listOpenSettlements } from '@/data/settlement';
import { recordAuditLog } from '@/data/audit';
import { handleApiError, parseBody } from '@/lib/errors';

const settlementSchema = z.object({
  partnerId: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  grossAmount: z.number().int().min(0),
  platformFee: z.number().int().min(0),
  netAmount: z.number().int().min(0),
  actorUserId: z.string().min(1).optional(),
});

export async function GET() {
  try {
    const settlements = await listOpenSettlements();
    return NextResponse.json(settlements);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = settlementSchema.parse(body);
    const settlement = await createSettlement({
      partnerId: input.partnerId,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      grossAmount: input.grossAmount,
      platformFee: input.platformFee,
      netAmount: input.netAmount,
    });

    await recordAuditLog({
      actorUserId: input.actorUserId,
      action: 'settlement.created',
      entityType: 'Settlement',
      entityId: settlement.id,
      metadata: { partnerId: input.partnerId, netAmount: input.netAmount },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
