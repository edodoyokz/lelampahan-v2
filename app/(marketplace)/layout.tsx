import Link from 'next/link';
import type { ReactNode } from 'react';

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lelampahan-cream">
      <header className="border-b border-lelampahan-gold/20 bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-lelampahan-earth">
            Lelampahan
          </Link>
          <div className="flex gap-6 text-sm font-medium text-lelampahan-brick">
            <Link href="/">Home</Link>
            <Link href="/account">My Orders</Link>
            <Link href="/partner">Partner</Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
