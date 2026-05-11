import { redirect } from 'next/navigation';
import { getCustomerDashboardSummary } from '@/data/dashboard-summary';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { getCurrentUser } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';

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

  const email = user.email || '-';
  const profile = await ensureUserProfileForAuthUser({
    authUserId: user.id,
    email: user.email,
    name: typeof displayName === 'string' ? displayName : null,
  });
  const summary = await getCustomerDashboardSummary(profile.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Akun"
        description="Pantau pesanan, tiket, dan informasi akun Anda di Lelampahan."
      >
        <p className="mt-3 text-lg font-semibold text-lelampahan-earth">Halo, {displayName}</p>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Pesanan" value={summary.totalOrders} helper="Riwayat booking Anda" />
        <StatCard label="Tiket Aktif" value={summary.activeTickets} helper="Siap digunakan saat check-in" />
        <StatCard label="Menunggu Pembayaran" value={summary.pendingPaymentOrders} helper="Selesaikan sebelum kedaluwarsa" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <QuickActionCard title="Jelajahi Pengalaman" description="Temukan tur, event, dan aktivitas budaya di Yogyakarta." href="/" />
          <QuickActionCard title="Tiket Saya" description="Lihat tiket QR untuk pesanan yang sudah dibayar." href="/account/tickets" />
          <QuickActionCard title="Riwayat Pesanan" description="Cek status booking dan pembayaran Anda." href="/account/orders" />
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lelampahan-gold text-xl font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lelampahan-earth">Profil Akun</h2>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Nama" value={displayName} readOnly className="bg-gray-50 cursor-default" />
            <Input label="Email" value={email} readOnly className="bg-gray-50 cursor-default" />
          </div>

          <p className="text-xs text-gray-400">
            Informasi profil dikelola melalui akun autentikasi Anda. Hubungi admin jika perlu mengubah data.
          </p>
        </div>
      </Card>
    </div>
  );
}
