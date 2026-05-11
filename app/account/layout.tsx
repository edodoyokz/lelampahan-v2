import type { ReactNode } from 'react';
import { AccountShell } from '@/components/layout/account-shell';
import { ToastProvider } from '@/components/ui/toast';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AccountShell>{children}</AccountShell>
    </ToastProvider>
  );
}
