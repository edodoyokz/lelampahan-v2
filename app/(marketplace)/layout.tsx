import type { ReactNode } from 'react';
import { MarketplaceHeader } from '@/components/layout/marketplace-header';
import { MarketplaceFooter } from '@/components/layout/marketplace-footer';
import { ToastProvider } from '@/components/ui/toast';

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-lelampahan-cream">
        <MarketplaceHeader user={null} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4">
          {children}
        </main>
        <MarketplaceFooter />
      </div>
    </ToastProvider>
  );
}
