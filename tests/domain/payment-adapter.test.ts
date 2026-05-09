import { describe, expect, it } from 'vitest';
import { createQrisPayment } from '@/domain/payment/qris-mock';

describe('mock QRIS adapter', () => {
  it('creates a pending payment with a mock QR code', () => {
    const payment = createQrisPayment({
      orderId: 'order-1',
      amount: 100000,
      idempotencyKey: 'payment:create:user-1:order-1:1',
      orderNumber: 'LM-20260509-ABCD',
    });

    expect(payment.status).toBe('PENDING');
    expect(payment.method).toBe('QRIS');
    expect(payment.qrString).toContain('lelampahan://qris');
    expect(payment.provider).toBe('MOCK_QRIS');
  });

  it('generates different QR for different orders', () => {
    const a = createQrisPayment({
      orderId: 'order-a',
      amount: 50000,
      idempotencyKey: 'key-a',
      orderNumber: 'LM-001',
    });
    const b = createQrisPayment({
      orderId: 'order-b',
      amount: 50000,
      idempotencyKey: 'key-b',
      orderNumber: 'LM-002',
    });

    expect(a.qrString).not.toBe(b.qrString);
  });
});
