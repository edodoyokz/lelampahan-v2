import { describe, expect, it } from 'vitest';
import type { QrisPaymentProvider } from '@/domain/payment/provider';

describe('QrisPaymentProvider contract', () => {
  it('allows providers to create normalized QRIS payment results', async () => {
    const provider: QrisPaymentProvider = {
      name: 'mock',
      async createQrisPayment(input) {
        return {
          provider: 'MOCK_QRIS',
          providerRef: `mock-${input.orderNumber}`,
          method: 'QRIS',
          amount: input.amount,
          status: 'PENDING',
          expiresAt: new Date('2026-05-10T10:30:00.000Z'),
          qrString: `lelampahan://qris/${input.orderNumber}`,
          rawPayload: { test: true },
        };
      },
    };

    const result = await provider.createQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-001',
      amount: 100000,
      idempotencyKey: 'payment:create:order-1:1',
    });

    expect(provider.name).toBe('mock');
    expect(result.method).toBe('QRIS');
    expect(result.amount).toBe(100000);
    expect(result.qrString).toContain('lelampahan://qris/LM-001');
  });
});
