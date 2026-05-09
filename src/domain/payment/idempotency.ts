export function createPaymentIdempotencyKey(input: {
  userId: string;
  orderId: string;
  attempt: number;
}): string {
  return `payment:create:${input.userId}:${input.orderId}:${input.attempt}`;
}

export function createWebhookIdempotencyKey(input: {
  provider: string;
  eventId: string;
}): string {
  return `payment:webhook:${input.provider}:${input.eventId}`;
}
