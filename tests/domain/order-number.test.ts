import { describe, expect, it } from 'vitest';
import { generateOrderNumber } from '@/lib/order-number';

describe('generateOrderNumber', () => {
  it('returns a string starting with LM- prefix', () => {
    const num = generateOrderNumber();
    expect(num.startsWith('LM-')).toBe(true);
    expect(num.length).toBeGreaterThanOrEqual(10);
  });
});
