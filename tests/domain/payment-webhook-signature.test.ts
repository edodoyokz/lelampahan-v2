import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { assertWebhookSignature, createWebhookSignature } from '@/domain/payment/webhook-signature';

describe('payment webhook signature', () => {
  it('accepts a valid HMAC SHA-256 signature', () => {
    const body = JSON.stringify({ orderId: 'order-1', status: 'PAID' });
    const signature = createHmac('sha256', 'secret').update(body).digest('hex');

    expect(() => assertWebhookSignature(body, signature, 'secret')).not.toThrow();
  });

  it('rejects an invalid signature', () => {
    const body = JSON.stringify({ orderId: 'order-1', status: 'PAID' });

    expect(() => assertWebhookSignature(body, 'bad-signature', 'secret')).toThrow(
      'Invalid webhook signature',
    );
  });

  it('generates deterministic signatures for the same payload', () => {
    const body = JSON.stringify({ orderId: 'order-1', status: 'PAID' });

    expect(createWebhookSignature(body, 'secret')).toBe(createWebhookSignature(body, 'secret'));
  });
});
