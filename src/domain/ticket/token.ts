import { createHmac, timingSafeEqual } from 'node:crypto';
import { DomainError } from '@/domain/shared/errors';

const TOKEN_VERSION = 'v1';

type TicketTokenPayload = {
  ticketCode: string;
  nonce: string;
};

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function unbase64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createTicketToken(payload: TicketTokenPayload, secret: string): string {
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${TOKEN_VERSION}.${encodedPayload}`;
  const signature = sign(data, secret);

  return `${data}.${signature}`;
}

export function verifyTicketToken(
  token: string,
  secret: string,
): { version: 'v1'; ticketCode: string; nonce: string } {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  const [version, encodedPayload, signature] = parts;

  if (version !== TOKEN_VERSION || !encodedPayload || !signature) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  const data = `${version}.${encodedPayload}`;
  const expectedSignature = sign(data, secret);
  const signatureBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new DomainError('INVALID_TICKET_TOKEN_SIGNATURE', 'Invalid ticket token signature');
  }

  const parsed = JSON.parse(unbase64url(encodedPayload)) as TicketTokenPayload;

  if (!parsed.ticketCode || !parsed.nonce) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  return { version: 'v1', ticketCode: parsed.ticketCode, nonce: parsed.nonce };
}
