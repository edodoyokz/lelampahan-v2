import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/role-badge';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Aktivitas" description="Area Super Admin untuk memantau aktivitas penting platform." />
      <Card variant="outlined" padding="lg">
        <RoleBadge role="SUPER_ADMIN" />
        <p className="mt-4 text-sm text-gray-600">Log audit akan menampilkan aksi admin, perubahan data penting, dan keputusan review.</p>
      </Card>
    </div>
  );
}
