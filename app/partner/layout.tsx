import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { PartnerShell } from '@/components/layout/partner-shell';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/supabase/client';
import { findPartnerContextByAuthUserId } from '@/data/partner';

function getUserLabel(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : user.email ?? 'Partner';
}

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const context = await findPartnerContextByAuthUserId(user.id);
  if (!context) redirect('/account');

  return (
    <ToastProvider>
      <PartnerShell userLabel={getUserLabel(user)} partnerName={context.partner.name}>
        {children}
      </PartnerShell>
    </ToastProvider>
  );
}
