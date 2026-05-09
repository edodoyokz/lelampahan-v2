import { describe, expect, it } from 'vitest';
import { canAccessAdminRoute, canAccessPartnerRoute, getUserRole } from '@/lib/auth/roles';

describe('auth role helpers', () => {
  it('allows only admin and super admin to access admin routes', () => {
    expect(canAccessAdminRoute('ADMIN')).toBe(true);
    expect(canAccessAdminRoute('SUPER_ADMIN')).toBe(true);
    expect(canAccessAdminRoute('CUSTOMER')).toBe(false);
    expect(canAccessAdminRoute(undefined)).toBe(false);
  });

  it('requires an authenticated user for partner routes', () => {
    expect(canAccessPartnerRoute(true)).toBe(true);
    expect(canAccessPartnerRoute(false)).toBe(false);
  });

  it('reads role from app metadata before user metadata', () => {
    expect(
      getUserRole({
        app_metadata: { role: 'ADMIN' },
        user_metadata: { role: 'CUSTOMER' },
      }),
    ).toBe('ADMIN');
  });
});
