import { randomBytes } from 'node:crypto';

export function generateOrderNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `LM-${datePart}-${rand}`;
}
