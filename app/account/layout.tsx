import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/layout/account-shell';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/supabase/client';

function getUserLabel(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : user.email ?? 'Pengguna';
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  return (
    <ToastProvider>
      <AccountShell userLabel={getUserLabel(user)}>{children}</AccountShell>
    </ToastProvider>
  );
}
