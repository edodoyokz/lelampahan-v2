import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-lelampahan-earth">
            Admin • Lelampahan
          </Link>
          <Link href="/" className="text-sm font-medium text-lelampahan-brick">
            Ke Marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/partners"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream"
            >
              Partners
            </Link>
            <Link
              href="/admin/listings"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream"
            >
              Listings
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
