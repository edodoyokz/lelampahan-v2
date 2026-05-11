'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { formatIDR } from '@/lib/format-currency';
import { PageHeader } from '@/components/ui/page-header';
import { QuickActionCard } from '@/components/ui/quick-action-card';

interface DashboardStats {
  totalPartners: number;
  totalListings: number;
  pendingReview: number;
  revenue: number;
}

function StatCardSkeleton() {
  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex-1">
          <SkeletonLoader variant="text" lines={2} className="max-w-[120px]" />
        </div>
      </div>
    </Card>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const statCards = [
  {
    key: 'totalPartners',
    label: 'Total Partner',
    icon: UsersIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-lelampahan-earth',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalListings',
    label: 'Total Pengalaman',
    icon: ListIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-lelampahan-earth',
    format: (v: number) => v.toString(),
  },
  {
    key: 'pendingReview',
    label: 'Menunggu Review',
    icon: ClockIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'revenue',
    label: 'Pendapatan',
    icon: CurrencyIcon,
    iconBg: 'bg-lelampahan-cream',
    iconColor: 'text-lelampahan-gold',
    valueColor: 'text-lelampahan-earth',
    format: (v: number) => formatIDR(v),
  },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [partnersRes, listingsRes] = await Promise.all([
          fetch('/api/admin/partners'),
          fetch('/api/admin/listings'),
        ]);

        let totalPartners = 0;
        let totalListings = 0;
        let pendingReview = 0;

        if (partnersRes.ok) {
          const data = await partnersRes.json();
          totalPartners = data.total ?? 0;
        }

        if (listingsRes.ok) {
          const data = await listingsRes.json();
          totalListings = data.total ?? 0;
          pendingReview = (data.listings ?? []).filter(
            (l: { status: string }) => l.status === 'PENDING_REVIEW'
          ).length;
        }

        setStats({
          totalPartners,
          totalListings,
          pendingReview,
          revenue: 0, // Pendapatan placeholder — no endpoint available yet
        });
      } catch {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Ringkasan data platform Lelampahan." />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => {
              const Icon = card.icon;
              const value = stats?.[card.key as keyof DashboardStats] ?? 0;
              return (
                <Card key={card.key} variant="elevated" padding="md">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                      <Icon />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${card.valueColor}`}>
                        {card.format(value)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-lelampahan-earth">Antrean Review</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <QuickActionCard title="Review Partner" description="Tinjau pendaftaran partner baru." href="/admin/partners" />
        <QuickActionCard title="Review Pengalaman" description="Tinjau pengalaman yang menunggu persetujuan." href="/admin/listings" />
      </div>
    </div>
  );
}
