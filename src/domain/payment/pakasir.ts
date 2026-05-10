import { Pakasir, type PaymentPayload } from 'pakasir-sdk';
import { DomainError } from '@/domain/shared/errors';
import type { QrisPaymentProvider } from './provider';

export interface PakasirConfig {
  projectSlug: string;
  apiKey: string;
  mode: 'sandbox' | 'production';
}

function createClient(config: PakasirConfig): Pakasir {
  return new Pakasir({
    slug: config.projectSlug,
    apikey: config.apiKey,
  });
}

function parseExpiry(expiredAt: PaymentPayload['expired_at']): Date {
  if (!expiredAt) {
    throw new DomainError('PAKASIR_INVALID_RESPONSE', 'Invalid Pakasir payment response');
  }

  const date = new Date(expiredAt);
  if (Number.isNaN(date.getTime())) {
    throw new DomainError('PAKASIR_INVALID_RESPONSE', 'Invalid Pakasir payment response');
  }

  return date;
}

function assertQrisPaymentPayload(payment: PaymentPayload): void {
  if (payment.payment_method !== 'qris') {
    throw new DomainError('PAKASIR_INVALID_METHOD', 'Pakasir returned non-QRIS payment');
  }

  if (!payment.payment_number || !payment.expired_at) {
    throw new DomainError('PAKASIR_INVALID_RESPONSE', 'Invalid Pakasir payment response');
  }
}

export function createPakasirQrisProvider(config: PakasirConfig): QrisPaymentProvider {
  const client = createClient(config);

  return {
    name: 'pakasir',
    async createQrisPayment(input) {
      let payment: PaymentPayload;
      try {
        payment = await client.createPayment('qris', input.orderNumber, input.amount);
      } catch (error) {
        throw new DomainError('PAKASIR_CREATE_PAYMENT_FAILED', 'Pakasir payment creation failed', {
          cause: error instanceof Error ? error.message : String(error),
        });
      }

      assertQrisPaymentPayload(payment);
      const qrString = payment.payment_number;
      if (!qrString) {
        throw new DomainError('PAKASIR_INVALID_RESPONSE', 'Invalid Pakasir payment response');
      }

      return {
        provider: 'PAKASIR',
        providerRef: payment.order_id,
        method: 'QRIS',
        amount: payment.amount,
        status: 'PENDING',
        expiresAt: parseExpiry(payment.expired_at),
        qrString,
        rawPayload: payment,
      };
    },
  };
}

export async function simulatePakasirPayment(input: PakasirConfig & {
  orderNumber: string;
  amount: number;
}): Promise<PaymentPayload> {
  if (input.mode !== 'sandbox') {
    throw new DomainError('PAKASIR_SIMULATION_DISABLED', 'Pakasir payment simulation is only available in sandbox mode');
  }

  const client = createClient(input);
  try {
    return await client.simulationPayment(input.orderNumber, input.amount);
  } catch (error) {
    throw new DomainError('PAKASIR_SIMULATION_FAILED', 'Pakasir payment simulation failed', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function fetchPakasirTransactionDetail(input: PakasirConfig & {
  orderNumber: string;
  amount: number;
}): Promise<PaymentPayload> {
  const client = createClient(input);
  try {
    return await client.detailPayment(input.orderNumber, input.amount);
  } catch (error) {
    throw new DomainError('PAKASIR_TRANSACTION_DETAIL_FAILED', 'Pakasir transaction detail lookup failed', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}
