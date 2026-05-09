import { describe, expect, it } from 'vitest';
import {
  createPaymentIdempotencyKey,
  createWebhookIdempotencyKey,
} from '@/domain/payment/idempotency';

describe('payment idempotency', () => {
  it('creates stable payment creation keys from user and order', () => {
    const first = createPaymentIdempotencyKey({ orderId: 'order_1', userId: 'user_1', attempt: 1 });
    const second = createPaymentIdempotencyKey({ orderId: 'order_1', userId: 'user_1', attempt: 1 });

    expect(first).toBe(second);
    expect(first).toBe('payment:create:user_1:order_1:1');
  });

  it('creates stable webhook keys from provider and event id', () => {
    expect(createWebhookIdempotencyKey({ provider: 'midtrans', eventId: 'evt_123' })).toBe(
      'payment:webhook:midtrans:evt_123',
    );
  });
});
