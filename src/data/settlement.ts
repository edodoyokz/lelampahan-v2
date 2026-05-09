import { LedgerDirection, LedgerEntryType, SettlementStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';
import { createOrderLedgerEntries } from '@/domain/settlement/service';

export async function createLedgerForPaidOrder(input: {
  orderId: string;
  partnerId: string;
  grossAmount: number;
  platformFeeBps?: number;
}) {
  const entries = createOrderLedgerEntries({
    orderId: input.orderId,
    partnerId: input.partnerId,
    grossAmount: input.grossAmount,
    platformFeeBps: input.platformFeeBps ?? 1000,
  });

  return prisma.ledgerEntry.createMany({
    data: entries.map((entry) => ({
      orderId: entry.orderId,
      partnerId: entry.partnerId,
      type: entry.type as LedgerEntryType,
      direction: entry.direction as LedgerDirection,
      amount: entry.amount,
      currency: entry.currency,
    })),
    skipDuplicates: true,
  });
}

export async function listOpenSettlements() {
  return prisma.settlement.findMany({
    where: { status: SettlementStatus.OPEN },
    orderBy: { createdAt: 'desc' },
    include: { partner: true, payouts: true },
  });
}

export async function createSettlement(input: {
  partnerId: string;
  periodStart: Date;
  periodEnd: Date;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
}) {
  return prisma.settlement.create({ data: input });
}
