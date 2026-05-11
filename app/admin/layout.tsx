import type { ReactNode } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/supabase/client';
import { getUserRole } from '@/lib/auth/roles';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const role = getUserRole(user);
  return (
    <ToastProvider>
      <AdminShell role={role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'}>{children}</AdminShell>
    </ToastProvider>
  );
}
