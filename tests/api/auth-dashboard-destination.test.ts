import { beforeEach, describe, expect, it, vi } from 'vitest';

const getApiUser = vi.fn<(request: Request) => unknown>();
const findPartnerContextByAuthUserId = vi.fn<(authUserId: string) => unknown>();

vi.mock('@/lib/auth/api', () => ({ getApiUser: (request: Request) => getApiUser(request) }));
vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: (authUserId: string) => findPartnerContextByAuthUserId(authUserId),
}));

const { GET } = await import('../../app/api/auth/dashboard-destination/route');

describe('GET /api/auth/dashboard-destination', () => {
  beforeEach(() => {
    getApiUser.mockReset();
    findPartnerContextByAuthUserId.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    getApiUser.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));

    expect(response.status).toBe(401);
  });

  it('returns /admin for admin users', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-admin', app_metadata: { role: 'ADMIN' }, user_metadata: {} });

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/admin' });
    expect(findPartnerContextByAuthUserId).not.toHaveBeenCalled();
  });

  it('returns /partner for customer users with partner membership', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-partner', app_metadata: { role: 'CUSTOMER' }, user_metadata: {} });
    findPartnerContextByAuthUserId.mockResolvedValue({ partner: { id: 'p1' } });

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/partner' });
  });

  it('returns /account for customers without partner membership', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-customer', app_metadata: { role: 'CUSTOMER' }, user_metadata: {} });
    findPartnerContextByAuthUserId.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/account' });
  });
});
