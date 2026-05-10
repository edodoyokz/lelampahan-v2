import { DomainError } from '@/domain/shared/errors';
import type { QrisPaymentProvider } from './provider';
import { mockQrisProvider } from './qris-mock';
import { createPakasirQrisProvider } from './pakasir';

export function getPaymentProvider(): QrisPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  if (provider === 'mock') return mockQrisProvider;

  if (provider === 'pakasir') {
    const projectSlug = process.env.PAKASIR_PROJECT_SLUG;
    const apiKey = process.env.PAKASIR_API_KEY;
    const mode = process.env.PAKASIR_MODE === 'production' ? 'production' : 'sandbox';

    if (!projectSlug || !apiKey) {
      throw new DomainError('PAKASIR_CONFIG_MISSING', 'Pakasir configuration is incomplete');
    }

    return createPakasirQrisProvider({ projectSlug, apiKey, mode });
  }

  throw new DomainError('UNSUPPORTED_PAYMENT_PROVIDER', `Unsupported payment provider: ${provider}`);
}
