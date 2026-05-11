export type PortalRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'PARTNER';

const labels: Record<PortalRole, string> = {
  CUSTOMER: 'Pelanggan',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  PARTNER: 'Partner',
};

const classes: Record<PortalRole, string> = {
  CUSTOMER: 'bg-blue-50 text-blue-700 border-blue-200',
  ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  PARTNER: 'bg-green-50 text-green-700 border-green-200',
};

export function RoleBadge({ role }: { role: PortalRole }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[role]}`}>
      {labels[role]}
    </span>
  );
}
