import { describe, expect, it } from 'vitest';
import { handleApiError } from '@/lib/errors';

describe('handleApiError', () => {
  it('does not expose generic error messages in production-safe response', async () => {
    const response = handleApiError(new Error('database password leaked'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });
});
