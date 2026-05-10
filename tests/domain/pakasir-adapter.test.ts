import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createPayment: vi.fn(),
  detailPayment: vi.fn(),
  simulationPayment: vi.fn(),
  pakasirConstructor: vi.fn(),
}));

vi.mock('pakasir-sdk', () => ({
  Pakasir: class {
    constructor(config: unknown) {
      mocks.pakasirConstructor(config);
      return {
        createPayment: mocks.createPayment,
        detailPayment: mocks.detailPayment,
        simulationPayment: mocks.simulationPayment,
      };
    }
  },
}));

import {
  createPakasirQrisProvider,
  fetchPakasirTransactionDetail,
  simulatePakasirPayment,
} from '@/domain/payment/pakasir';

describe('Pakasir QRIS provider', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates QRIS payment through pakasir-sdk', async () => {
    mocks.createPayment.mockResolvedValueOnce({
      project: 'lelampahan',
      order_id: 'LM-001',
      amount: 100000,
      fee: 1003,
      total_payment: 101003,
      payment_method: 'qris',
      payment_number: 'QR_STRING',
      expired_at: '2026-05-10T10:30:00.000Z',
      status: 'pending',
      payment_url: null,
      redirect_url: null,
      completed_at: null,
    });

    const provider = createPakasirQrisProvider({
      projectSlug: 'lelampahan',
      apiKey: 'pakasir-api-key',
      mode: 'sandbox',
    });

    const result = await provider.createQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-001',
      amount: 100000,
      idempotencyKey: 'payment:create:order-1:1',
    });

    expect(mocks.pakasirConstructor).toHaveBeenCalledWith({
      slug: 'lelampahan',
      apikey: 'pakasir-api-key',
    });
    expect(mocks.createPayment).toHaveBeenCalledWith('qris', 'LM-001', 100000);
    expect(result.provider).toBe('PAKASIR');
    expect(result.providerRef).toBe('LM-001');
    expect(result.method).toBe('QRIS');
    expect(result.amount).toBe(100000);
    expect(result.qrString).toBe('QR_STRING');
    expect(result.expiresAt.toISOString()).toBe('2026-05-10T10:30:00.000Z');
    expect(result.rawPayload).toEqual(expect.objectContaining({ total_payment: 101003 }));
  });

  it('throws when Pakasir returns missing QR string', async () => {
    mocks.createPayment.mockResolvedValueOnce({
      project: 'lelampahan',
      order_id: 'LM-001',
      amount: 100000,
      payment_method: 'qris',
      payment_number: null,
      expired_at: '2026-05-10T10:30:00.000Z',
      status: 'pending',
    });

    const provider = createPakasirQrisProvider({
      projectSlug: 'lelampahan',
      apiKey: 'pakasir-api-key',
      mode: 'sandbox',
    });

    await expect(
      provider.createQrisPayment({
        orderId: 'order-1',
        orderNumber: 'LM-001',
        amount: 100000,
        idempotencyKey: 'payment:create:order-1:1',
      }),
    ).rejects.toThrow('Invalid Pakasir payment response');
  });

  it('calls Pakasir payment simulation through pakasir-sdk', async () => {
    mocks.simulationPayment.mockResolvedValueOnce({ status: 'completed', order_id: 'LM-001' });

    await expect(
      simulatePakasirPayment({
        projectSlug: 'lelampahan',
        apiKey: 'pakasir-api-key',
        mode: 'sandbox',
        orderNumber: 'LM-001',
        amount: 100000,
      }),
    ).resolves.toEqual({ status: 'completed', order_id: 'LM-001' });

    expect(mocks.simulationPayment).toHaveBeenCalledWith('LM-001', 100000);
  });

  it('fetches Pakasir transaction detail through pakasir-sdk', async () => {
    mocks.detailPayment.mockResolvedValueOnce({ status: 'completed', order_id: 'LM-001' });

    await expect(
      fetchPakasirTransactionDetail({
        projectSlug: 'lelampahan',
        apiKey: 'pakasir-api-key',
        mode: 'sandbox',
        orderNumber: 'LM-001',
        amount: 100000,
      }),
    ).resolves.toEqual({ status: 'completed', order_id: 'LM-001' });

    expect(mocks.detailPayment).toHaveBeenCalledWith('LM-001', 100000);
  });
});
