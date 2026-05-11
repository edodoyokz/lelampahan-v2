import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { findOrderCountByUser, findPendingPaymentOrderCountByUser } from '@/data/order';
import { findActiveTicketCountByUser } from '@/data/ticket';

export default async function AccountProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pengguna';

  const [totalOrders, activeTickets, pendingPayments] = await Promise.all([
    findOrderCountByUser(user.id),
    findActiveTicketCountByUser(user.id),
    findPendingPaymentOrderCountByUser(user.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Akun"
        description="Pantau pesanan, tiket, dan informasi akun Anda di Lelampahan."
      >
        <p className="mt-3 text-lg font-semibold text-lelampahan-earth">Halo, {displayName}</p>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Pesanan" value={totalOrders} helper="Riwayat booking Anda" />
        <StatCard label="Tiket Aktif" value={activeTickets} helper="Siap digunakan saat check-in" />
        <StatCard label="Menunggu Pembayaran" value={pendingPayments} helper="Selesaikan sebelum kedaluwarsa" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <QuickActionCard title="Jelajahi Pengalaman" description="Temukan tur, event, dan aktivitas budaya di Yogyakarta." href="/" />
          <QuickActionCard title="Tiket Saya" description="Lihat tiket QR untuk pesanan yang sudah dibayar." href="/account/tickets" />
          <QuickActionCard title="Riwayat Pesanan" description="Cek status booking dan pembayaran Anda." href="/account/orders" />
          {pendingPayments > 0 && (
            <QuickActionCard title="Lanjutkan Pembayaran" description="Selesaikan pesanan yang masih menunggu pembayaran." href="/account/orders" />
          )}
        </div>
      </div>

      {/* Compact profile summary */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lelampahan-gold text-xl font-semibold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lelampahan-earth">{displayName}</p>
          <p className="text-sm text-gray-500">{user.email ?? '-'}</p>
        </div>
      </div>
    </div>
  );
}
