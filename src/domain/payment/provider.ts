import type { CreatePaymentInput, CreatePaymentResult } from './adapter';

export type PaymentProviderName = 'mock' | 'pakasir';

export interface QrisPaymentProvider {
  name: PaymentProviderName;
  createQrisPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}
