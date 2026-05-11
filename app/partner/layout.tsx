import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { PartnerShell } from '@/components/layout/partner-shell';
import { getCurrentUser } from '@/lib/supabase/client';
import { findPartnerContextByAuthUserId } from '@/data/partner';

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const context = await findPartnerContextByAuthUserId(user.id);
  if (!context) redirect('/account');

  return <PartnerShell>{children}</PartnerShell>;
}
