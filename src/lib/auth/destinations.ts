import type { AppRole } from '@/lib/auth/roles';

export function resolveDashboardDestination(input: {
  role: AppRole;
  hasPartnerMembership: boolean;
}) {
  if (input.role === 'ADMIN' || input.role === 'SUPER_ADMIN') return '/admin';
  if (input.hasPartnerMembership) return '/partner';
  return '/account';
}
