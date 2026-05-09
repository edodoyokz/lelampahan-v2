import { createHmac, timingSafeEqual } from 'node:crypto';
import { DomainError } from '@/domain/shared/errors';

export function createWebhookSignature(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function assertWebhookSignature(
  rawBody: string,
  providedSignature: string | null,
  secret: string,
): void {
  if (!providedSignature) {
    throw new DomainError('MISSING_WEBHOOK_SIGNATURE', 'Missing webhook signature');
  }

  const expected = createWebhookSignature(rawBody, secret);
  const expectedBuffer = Buffer.from(expected, 'hex');
  const providedBuffer = Buffer.from(providedSignature, 'hex');

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    throw new DomainError('INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook signature');
  }
}
