import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/supabase/client';
import { getUserRole } from '@/lib/auth/roles';

function getUserLabel(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : user.email ?? 'Admin';
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const role = getUserRole(user);
  return (
    <ToastProvider>
      <AdminShell role={role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'} userLabel={getUserLabel(user)}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
