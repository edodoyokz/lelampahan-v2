import { afterEach, describe, expect, it } from 'vitest';
import { getPaymentProvider } from '@/domain/payment/factory';

describe('getPaymentProvider', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to mock provider when PAYMENT_PROVIDER is missing', () => {
    delete process.env.PAYMENT_PROVIDER;

    expect(getPaymentProvider().name).toBe('mock');
  });

  it('returns mock provider when PAYMENT_PROVIDER=mock', () => {
    process.env.PAYMENT_PROVIDER = 'mock';

    expect(getPaymentProvider().name).toBe('mock');
  });

  it('returns Pakasir provider when required env is present', () => {
    process.env.PAYMENT_PROVIDER = 'pakasir';
    process.env.PAKASIR_PROJECT_SLUG = 'lelampahan';
    process.env.PAKASIR_API_KEY = 'pakasir-api-key';
    process.env.PAKASIR_MODE = 'sandbox';

    expect(getPaymentProvider().name).toBe('pakasir');
  });

  it('rejects missing Pakasir credentials', () => {
    process.env.PAYMENT_PROVIDER = 'pakasir';
    delete process.env.PAKASIR_PROJECT_SLUG;
    delete process.env.PAKASIR_API_KEY;

    expect(() => getPaymentProvider()).toThrow('Pakasir configuration is incomplete');
  });

  it('rejects unknown payment providers', () => {
    process.env.PAYMENT_PROVIDER = 'midtrans';

    expect(() => getPaymentProvider()).toThrow('Unsupported payment provider');
  });
});
