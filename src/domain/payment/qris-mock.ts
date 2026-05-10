import { randomBytes } from 'node:crypto';
import { CreatePaymentInput, CreatePaymentResult } from './adapter';
import type { QrisPaymentProvider } from './provider';

const DEFAULT_EXPIRY_MINUTES = 30;

export function createExpiry(minutes = DEFAULT_EXPIRY_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function createQrisPayment(input: CreatePaymentInput): CreatePaymentResult {
  const ref = `MOCK-QRIS-${randomBytes(8).toString('hex')}`;

  return {
    provider: 'MOCK_QRIS',
    providerRef: ref,
    method: 'QRIS',
    amount: input.amount,
    status: 'PENDING',
    expiresAt: createExpiry(),
    qrString: `lelampahan://qris/${input.orderNumber}/${ref}`,
  };
}

export const mockQrisProvider: QrisPaymentProvider = {
  name: 'mock',
  async createQrisPayment(input) {
    return createQrisPayment(input);
  },
};
