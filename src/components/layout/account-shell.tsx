'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AccountNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const accountNavItems: AccountNavItem[] = [
  {
    label: 'Profil',
    href: '/account',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    label: 'Pesanan',
    href: '/account/orders',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
        />
      </svg>
    ),
  },
  {
    label: 'Tiket Saya',
    href: '/account/tickets',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
        />
      </svg>
    ),
  },
];

export interface AccountShellProps {
  children: React.ReactNode;
}

export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    // For the root /account path, match exactly
    if (href === '/account') return pathname === '/account';
    // For sub-paths, match prefix
    return pathname.startsWith(href);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      {/* Mobile: Horizontal tab navigation above content */}
      <nav
        className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 md:hidden"
        aria-label="Account navigation"
      >
        {accountNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors duration-150
                ${
                  active
                    ? 'border-lelampahan-gold text-lelampahan-earth font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `.trim()}
              aria-current={active ? 'page' : undefined}
            >
              <span className="h-4 w-4 shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-8">
        {/* Desktop: Sidebar navigation */}
        <aside className="hidden md:block w-56 shrink-0" aria-label="Account navigation">
          <nav className="flex flex-col gap-1">
            {accountNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150
                    ${
                      active
                        ? 'bg-lelampahan-cream text-lelampahan-earth font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `.trim()}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="h-5 w-5 shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content area */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
