import { describe, expect, it } from 'vitest';
import { resolveDashboardDestination } from '@/lib/auth/destinations';

describe('resolveDashboardDestination', () => {
  it('sends admins to admin dashboard', () => {
    expect(resolveDashboardDestination({ role: 'ADMIN', hasPartnerMembership: false })).toBe('/admin');
  });

  it('sends super admins to admin dashboard', () => {
    expect(resolveDashboardDestination({ role: 'SUPER_ADMIN', hasPartnerMembership: false })).toBe('/admin');
  });

  it('sends partner members to partner dashboard', () => {
    expect(resolveDashboardDestination({ role: 'CUSTOMER', hasPartnerMembership: true })).toBe('/partner');
  });

  it('sends customers without partner membership to account dashboard', () => {
    expect(resolveDashboardDestination({ role: 'CUSTOMER', hasPartnerMembership: false })).toBe('/account');
  });
});
