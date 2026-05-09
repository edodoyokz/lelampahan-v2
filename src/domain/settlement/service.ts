import { DomainError } from '@/domain/shared/errors';

export type LedgerEntryType = 'CUSTOMER_PAYMENT' | 'PLATFORM_FEE' | 'PARTNER_PAYABLE' | 'REFUND';
export type LedgerDirection = 'DEBIT' | 'CREDIT';

export interface LedgerEntryDraft {
  orderId: string;
  partnerId: string;
  type: LedgerEntryType;
  direction: LedgerDirection;
  amount: number;
  currency: 'IDR';
}

export function createOrderLedgerEntries(input: {
  orderId: string;
  partnerId: string;
  grossAmount: number;
  platformFeeBps: number;
}): LedgerEntryDraft[] {
  if (input.grossAmount <= 0) {
    throw new DomainError('INVALID_LEDGER_AMOUNT', 'Gross amount must be positive');
  }

  if (input.platformFeeBps < 0 || input.platformFeeBps > 10_000) {
    throw new DomainError('INVALID_PLATFORM_FEE', 'Platform fee bps must be between 0 and 10000');
  }

  const platformFee = Math.round((input.grossAmount * input.platformFeeBps) / 10_000);
  const partnerPayable = input.grossAmount - platformFee;

  return [
    {
      orderId: input.orderId,
      partnerId: input.partnerId,
      type: 'CUSTOMER_PAYMENT',
      direction: 'CREDIT',
      amount: input.grossAmount,
      currency: 'IDR',
    },
    {
      orderId: input.orderId,
      partnerId: input.partnerId,
      type: 'PLATFORM_FEE',
      direction: 'CREDIT',
      amount: platformFee,
      currency: 'IDR',
    },
    {
      orderId: input.orderId,
      partnerId: input.partnerId,
      type: 'PARTNER_PAYABLE',
      direction: 'CREDIT',
      amount: partnerPayable,
      currency: 'IDR',
    },
  ];
}
