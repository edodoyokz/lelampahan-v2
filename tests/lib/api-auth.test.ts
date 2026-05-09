import { describe, expect, it } from 'vitest';
import { parseCookieHeader } from '@/lib/auth/api';

describe('api auth helpers', () => {
  it('parses cookie header into Supabase cookie shape', () => {
    expect(parseCookieHeader('a=1; b=hello%20world')).toEqual([
      { name: 'a', value: '1' },
      { name: 'b', value: 'hello world' },
    ]);
  });

  it('returns empty array for missing cookie header', () => {
    expect(parseCookieHeader(null)).toEqual([]);
  });
});
