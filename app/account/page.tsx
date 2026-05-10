import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <SkeletonLoader variant="text" lines={2} />
        <SkeletonLoader variant="text" lines={2} />
      </div>
    </div>
  );
}

async function ProfileContent() {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-lelampahan-earth">Profil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Informasi akun Anda di Lelampahan.
        </p>
      </div>

      {/* Profile Card */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lelampahan-gold text-white text-xl font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-lelampahan-earth">
                {displayName}
              </p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Profile Fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Nama"
              value={displayName}
              readOnly
              className="bg-gray-50 cursor-default"
            />
            <Input
              label="Email"
              value={email}
              readOnly
              className="bg-gray-50 cursor-default"
            />
          </div>

          {/* Info Note */}
          <p className="text-xs text-gray-400">
            Informasi profil dikelola melalui akun autentikasi Anda. Hubungi
            admin jika perlu mengubah data.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
