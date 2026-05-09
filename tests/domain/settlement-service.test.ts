import { describe, expect, it } from 'vitest';
import { createOrderLedgerEntries } from '@/domain/settlement/service';

describe('settlement service', () => {
  it('creates balanced order ledger entries with platform fee and partner payable', () => {
    const entries = createOrderLedgerEntries({
      orderId: 'order-1',
      partnerId: 'partner-1',
      grossAmount: 100000,
      platformFeeBps: 1000,
    });

    expect(entries).toEqual([
      expect.objectContaining({ type: 'CUSTOMER_PAYMENT', direction: 'CREDIT', amount: 100000 }),
      expect.objectContaining({ type: 'PLATFORM_FEE', direction: 'CREDIT', amount: 10000 }),
      expect.objectContaining({ type: 'PARTNER_PAYABLE', direction: 'CREDIT', amount: 90000 }),
    ]);
  });

  it('rejects negative gross amount', () => {
    expect(() =>
      createOrderLedgerEntries({
        orderId: 'order-1',
        partnerId: 'partner-1',
        grossAmount: -1,
        platformFeeBps: 1000,
      }),
    ).toThrow('Gross amount must be positive');
  });
});
