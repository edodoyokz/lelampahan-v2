import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: mocks.getUser },
  }),
}));

import { middleware } from '../../app/middleware';

function request(pathname: string) {
  return new NextRequest(new URL(`https://lelampahan.test${pathname}`));
}

describe('middleware admin access', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects regular admin away from super admin routes', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { app_metadata: { role: 'ADMIN' } } } });

    const response = await middleware(request('/admin/users'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://lelampahan.test/admin');
  });

  it('allows super admin to access super admin routes', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { app_metadata: { role: 'SUPER_ADMIN' } } } });

    const response = await middleware(request('/admin/audit'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
