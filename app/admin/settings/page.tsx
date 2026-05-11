import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/role-badge';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Platform" description="Area Super Admin untuk konfigurasi operasional Lelampahan." />
      <Card variant="outlined" padding="lg">
        <RoleBadge role="SUPER_ADMIN" />
        <p className="mt-4 text-sm text-gray-600">Pengaturan platform akan mencakup konfigurasi marketplace, payout, dan preferensi operasional.</p>
      </Card>
    </div>
  );
}
