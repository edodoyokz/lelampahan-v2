import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/role-badge';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Manajemen Pengguna" description="Area Super Admin untuk mengelola akun, role, dan akses platform." />
      <Card variant="outlined" padding="lg">
        <RoleBadge role="SUPER_ADMIN" />
        <p className="mt-4 text-sm text-gray-600">Fitur pengelolaan pengguna akan mencakup pencarian akun, perubahan role, dan peninjauan akses.</p>
      </Card>
    </div>
  );
}
