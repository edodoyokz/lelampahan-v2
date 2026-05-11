import type { ReactNode } from 'react';
import { MarketplaceHeader } from '@/components/layout/marketplace-header';
import { MarketplaceFooter } from '@/components/layout/marketplace-footer';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/supabase/client';

function getDisplayName(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return null;

  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null;

  return metadataName ?? user.email?.split('@')[0] ?? 'Pengguna';
}

export default async function MarketplaceLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const displayName = getDisplayName(user);

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-lelampahan-cream">
        <MarketplaceHeader user={displayName ? { name: displayName } : null} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4">
          {children}
        </main>
        <MarketplaceFooter />
      </div>
    </ToastProvider>
  );
}
