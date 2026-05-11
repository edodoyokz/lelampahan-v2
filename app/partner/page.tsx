'use client';

import { useEffect, useState } from 'react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { formatIDR } from '@/lib/format-currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';

interface PartnerContext {
  role: string;
  partner: { id: string; name: string; status: string };
}

interface PartnerSummary {
  activeListings: number;
  draftReviewListings: number;
  requestedBookings: number;
  pendingPaymentBookings: number;
  monthlyPaidOrders: number;
  estimatedMonthlyRevenue: number;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonLoader variant="text" lines={2} className="max-w-sm" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  const [context, setContext] = useState<PartnerContext | null>(null);
  const [summary, setSummary] = useState<PartnerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const contextResponse = await fetch('/api/partner/me', { cache: 'no-store' });
        if (!contextResponse.ok) {
          setError(contextResponse.status === 404 ? 'Akun belum terhubung ke partner.' : 'Masuk sebagai partner diperlukan.');
          setLoading(false);
          return;
        }

        const partnerContext = await contextResponse.json();
        setContext(partnerContext);

        const summaryResponse = await fetch('/api/partner/dashboard-summary', { cache: 'no-store' });
        if (!summaryResponse.ok) {
          setError('Gagal memuat ringkasan dashboard.');
          setLoading(false);
          return;
        }

        const dashboardSummary = await summaryResponse.json();
        setSummary(dashboardSummary);
      } catch {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard Partner" description="Ringkasan performa dan operasional partner." />
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard Partner" description="Ringkasan performa dan operasional partner." />

      {context && (
        <div className="rounded-xl border border-lelampahan-gold/20 bg-lelampahan-cream/70 p-4 text-sm text-lelampahan-earth">
          {context.partner.name} · {context.role} · {context.partner.status}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pengalaman Aktif" value={summary?.activeListings ?? 0} />
        <StatCard label="Draft/Review" value={summary?.draftReviewListings ?? 0} helper="Butuh dilengkapi atau menunggu admin" />
        <StatCard label="Pesanan Bulan Ini" value={summary?.monthlyPaidOrders ?? 0} helper={`${summary?.requestedBookings ?? 0} permintaan · ${summary?.pendingPaymentBookings ?? 0} menunggu pembayaran`} />
        <StatCard label="Pendapatan Estimasi" value={formatIDR(summary?.estimatedMonthlyRevenue ?? 0)} helper="Order paid/completed bulan ini" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <QuickActionCard title="Buat Pengalaman" description="Tambahkan tur atau acara baru." href="/partner/listings/new" />
          <QuickActionCard title="Kelola Pengalaman" description="Edit listing dan sesi yang sudah dibuat." href="/partner/listings" />
          <QuickActionCard title="Lihat Pesanan" description="Kelola pesanan masuk." href="/partner/bookings" />
          <QuickActionCard title="Pindai Tiket" description="Validasi tiket peserta." href="/partner/scanner" />
        </div>
      </div>
    </div>
  );
}
