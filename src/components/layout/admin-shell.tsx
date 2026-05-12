'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNavigation, type NavItem } from '@/components/layout/sidebar-navigation';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';

function Icon({ children }: { children: React.ReactNode }) {
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{children}</svg>;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></Icon> },
  { label: 'Partners', href: '/admin/partners', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></Icon> },
  { label: 'Pengalaman', href: '/admin/listings', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></Icon> },
  { label: 'Refund', href: '/admin/refunds', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></Icon> },
];

const superAdminNavItems: NavItem[] = [
  { label: 'Pengguna', href: '/admin/users', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07" /></Icon> },
  { label: 'Audit', href: '/admin/audit', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" /></Icon> },
  { label: 'Settlement', href: '/admin/settlements', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon> },
  { label: 'Pengaturan', href: '/admin/settings', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0" /></Icon> },
];

interface AdminShellProps {
  children: React.ReactNode;
  role?: 'ADMIN' | 'SUPER_ADMIN';
  userLabel: string;
}

export function AdminShell({ children, role = 'ADMIN', userLabel }: AdminShellProps) {
  const pathname = usePathname();
  const items = role === 'SUPER_ADMIN' ? [...adminNavItems, ...superAdminNavItems] : adminNavItems;

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation items={items} currentPath={pathname} title="Admin" mobileVariant="drawer" />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <DashboardTopbar title="Admin Dashboard" userLabel={userLabel} role={role} />
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
