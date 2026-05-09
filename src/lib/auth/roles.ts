export type AppRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

const roles = new Set<AppRole>(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']);

type Metadata = Record<string, unknown> | null | undefined;

type RoleCarrier = {
  app_metadata?: Metadata;
  user_metadata?: Metadata;
};

function normalizeRole(value: unknown): AppRole | undefined {
  return typeof value === 'string' && roles.has(value as AppRole) ? (value as AppRole) : undefined;
}

export function getUserRole(user: RoleCarrier | null | undefined): AppRole {
  return (
    normalizeRole(user?.app_metadata?.role) ??
    normalizeRole(user?.user_metadata?.role) ??
    'CUSTOMER'
  );
}

export function canAccessAdminRoute(role: AppRole | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function canAccessPartnerRoute(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}
