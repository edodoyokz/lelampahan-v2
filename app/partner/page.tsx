'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { formatIDR } from '@/lib/format-currency';

interface PartnerContext {
  role: string;
  partner: { id: string; name: string; status: string };
}

function ListingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ClipboardListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm14 3h.01M17 17h.01M14 14h3v3h-3v-3zm3 3h3v3h-3v-3z" />
    </svg>
  );
}

function StatCardSkeleton() {
  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <SkeletonLoader variant="text" lines={2} className="max-w-sm" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="mt-10">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  const [context, setContext] = useState<PartnerContext | null>(null);
  const [activeListings, setActiveListings] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const contextResponse = await fetch('/api/partner/me', { cache: 'no-store' });
        if (!contextResponse.ok) {
          setError(
            contextResponse.status === 404
              ? 'Akun belum terhubung ke partner.'
              : 'Login partner diperlukan.'
          );
          setLoading(false);
          return;
        }

        const partnerContext = await contextResponse.json();
        setContext(partnerContext);

        const listingsResponse = await fetch(
          `/api/partner/${partnerContext.partner.id}/listings`,
          { cache: 'no-store' }
        );
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          const publishedCount = (listingsData.listings ?? []).filter(
            (listing: { status: string }) => listing.status === 'PUBLISHED'
          ).length;
          setActiveListings(publishedCount);
        }

        // Monthly orders and revenue would come from a dedicated API endpoint
        // For now, we keep them at 0 as the API doesn't exist yet
        setMonthlyOrders(0);
        setEstimatedRevenue(0);
      } catch {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: <ListingsIcon />,
      label: 'Listings Aktif',
      value: activeListings.toString(),
      color: 'bg-amber-50 text-lelampahan-gold',
    },
    {
      icon: <OrdersIcon />,
      label: 'Pesanan Bulan Ini',
      value: monthlyOrders.toString(),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <RevenueIcon />,
      label: 'Pendapatan Estimasi',
      value: formatIDR(estimatedRevenue),
      color: 'bg-green-50 text-green-600',
    },
  ];

  const quickActions = [
    {
      icon: <PlusIcon />,
      title: 'Buat Listing Baru',
      description: 'Tambahkan tour atau event baru',
      href: '/partner/listings/new',
    },
    {
      icon: <ClipboardListIcon />,
      title: 'Lihat Pesanan',
      description: 'Kelola pesanan masuk',
      href: '/partner/bookings',
    },
    {
      icon: <QrCodeIcon />,
      title: 'Scan Tiket',
      description: 'Validasi tiket peserta',
      href: '/partner/scanner',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <p className="mt-1 text-sm text-gray-500">
        {context
          ? `${context.partner.name} · ${context.role} · ${context.partner.status}`
          : 'Selamat datang di portal partner Lelampahan.'}
      </p>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-lelampahan-earth">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Aksi Cepat */}
      <h2 className="mt-10 text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card
              variant="outlined"
              padding="md"
              className="transition hover:border-lelampahan-gold hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lelampahan-cream text-lelampahan-gold">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lelampahan-earth">{action.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
