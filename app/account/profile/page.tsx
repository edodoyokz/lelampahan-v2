import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/lib/supabase/client';

export default async function AccountProfileDetailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pengguna';

  const email = user.email || '-';

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Akun" description="Informasi dasar akun Lelampahan Anda." />
      <Card variant="elevated" padding="lg">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Nama" value={displayName} readOnly className="bg-gray-50 cursor-default" />
          <Input label="Email" value={email} readOnly className="bg-gray-50 cursor-default" />
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Informasi profil dikelola melalui akun autentikasi Anda. Hubungi admin jika perlu mengubah data.
        </p>
      </Card>
    </div>
  );
}
