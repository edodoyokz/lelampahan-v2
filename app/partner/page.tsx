'use client';

import { useEffect, useState } from 'react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { formatIDR } from '@/lib/format-currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';

interface PartnerDashboardData {
  partner: { id: string; name: string; status: string; role: string };
  listings: { total: number; draft: number; pendingReview: number; published: number; rejected: number };
  bookings: { requested: number; pendingPayment: number; approved: number; completed: number; monthCount: number };
  revenue: { monthGross: number; estimatedPayout: number };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonLoader variant="text" lines={2} className="max-w-sm" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  const [dashboard, setDashboard] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/partner/dashboard', { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 404) setError('Akun belum terhubung ke partner.');
          else setError('Masuk sebagai partner diperlukan.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setDashboard(data);
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

  if (!dashboard) return null;

  const isApproved = dashboard.partner.status === 'APPROVED';
  const isRejected = dashboard.partner.status === 'REJECTED';

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard Partner" description="Ringkasan performa dan operasional partner." />

      {/* Partner status card */}
      <div className="rounded-xl border border-lelampahan-gold/20 bg-lelampahan-cream/70 p-4 text-sm text-lelampahan-earth">
        {dashboard.partner.name} · {dashboard.partner.role} · {dashboard.partner.status}
      </div>

      {/* Status messages for non-approved partners */}
      {isRejected && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Pendaftaran partner ditolak. Hubungi admin untuk peninjauan ulang.
        </p>
      )}
      {!isApproved && !isRejected && (
        <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Pendaftaran partner sedang menunggu review admin.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pengalaman Aktif" value={dashboard.listings.published} />
        <StatCard label="Draft/Review" value={dashboard.listings.draft + dashboard.listings.pendingReview} helper="Butuh dilengkapi atau menunggu admin" />
        <StatCard label="Pesanan Bulan Ini" value={dashboard.bookings.monthCount} />
        <StatCard label="Pendapatan Estimasi" value={formatIDR(dashboard.revenue.estimatedPayout)} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <QuickActionCard title="Buat Pengalaman" description="Tambahkan tur atau acara baru." href="/partner/listings/new" />
          <QuickActionCard title="Kelola Pengalaman" description="Edit listing dan sesi yang sudah dibuat." href="/partner/listings" />
          {isApproved && (
            <>
              <QuickActionCard title="Lihat Pesanan" description="Kelola pesanan masuk." href="/partner/bookings" />
              <QuickActionCard title="Pindai Tiket" description="Validasi tiket peserta." href="/partner/scanner" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
