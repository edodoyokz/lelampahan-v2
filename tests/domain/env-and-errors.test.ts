import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DomainError } from '@/domain/shared/errors';

const ORIGINAL_ENV = process.env;

describe('DomainError', () => {
  it('stores a stable code and message', () => {
    const error = new DomainError('INVALID_TRANSITION', 'Invalid order transition');

    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('INVALID_TRANSITION');
    expect(error.message).toBe('Invalid order transition');
  });
});

describe('env module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws a readable error when required variables are missing', async () => {
    process.env = { NODE_ENV: 'test' };

    await expect(import('@/config/env')).rejects.toThrow('Missing required environment variable');
  });

  it('parses env successfully when all variables are present', async () => {
    process.env = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://localhost/test',
      DIRECT_URL: 'postgresql://localhost/test',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-here',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-here',
      TICKET_TOKEN_SECRET: 'this-is-a-32-byte-secret!!',
      APP_BASE_URL: 'http://localhost:3000',
    };

    const { env } = await import('@/config/env');

    expect(env.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(env.APP_BASE_URL).toBe('http://localhost:3000');
  });
});
