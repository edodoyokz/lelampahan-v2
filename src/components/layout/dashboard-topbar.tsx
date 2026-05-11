import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { RoleBadge } from '@/components/ui/role-badge';
import type { AppRole } from '@/lib/auth/roles';

interface DashboardTopbarProps {
  title: string;
  userLabel: string;
  role: AppRole | 'PARTNER';
  partnerName?: string;
}

export function DashboardTopbar({ title, userLabel, role, partnerName }: DashboardTopbarProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/" className="text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick">
          ← Marketplace
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-lelampahan-earth">{title}</h1>
          {role === 'PARTNER' ? (
            <span className="rounded-full bg-lelampahan-cream px-2 py-0.5 text-xs font-medium text-lelampahan-earth">Partner</span>
          ) : (
            <RoleBadge role={role} />
          )}
        </div>
        {partnerName && <p className="mt-1 text-sm text-gray-500">{partnerName}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="max-w-[220px] truncate text-sm text-gray-600">{userLabel}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
