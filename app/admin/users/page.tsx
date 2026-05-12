'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { useToast } from '@/components/ui/toast';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Pelanggan',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_VARIANTS: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  CUSTOMER: 'neutral',
  ADMIN: 'info',
  SUPER_ADMIN: 'warning',
};

const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const DEFAULT_PAGE_SIZE = 50;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const { showToast } = useToast();

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      params.set('page', String(page));
      params.set('pageSize', String(DEFAULT_PAGE_SIZE));
      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Gagal memuat data pengguna.');
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotalItems(data.total ?? 0);
    } catch {
      setError('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [page, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRoleUpdate() {
    if (!editUser || !newRole) return;
    setRoleLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editUser.id, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast({ type: 'error', message: data.error ?? 'Gagal mengubah role.' });
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, role: newRole } : u))
      );
      showToast({ type: 'success', message: `Role ${editUser.email} diubah ke ${ROLE_LABELS[newRole] ?? newRole}.` });
      setEditUser(null);
    } catch {
      showToast({ type: 'error', message: 'Terjadi kesalahan.' });
    } finally {
      setRoleLoading(false);
    }
  }

  const columns: Column<UserData>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.email}</p>
          {item.name && <p className="text-xs text-gray-500">{item.name}</p>}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => (
        <StatusBadge
          status={ROLE_VARIANTS[item.role] ?? 'neutral'}
          label={ROLE_LABELS[item.role] ?? item.role}
        />
      ),
    },
    {
      key: 'orders',
      header: 'Pesanan',
      render: (item) => <span className="text-sm text-gray-600">{item._count.orders}</span>,
    },
    {
      key: 'createdAt',
      header: 'Bergabung',
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setEditUser(item); setNewRole(item.role); }}
        >
          Ubah Role
        </Button>
      ),
    },
  ];

  const mobileCardRender = (item: UserData) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{item.email}</p>
          {item.name && <p className="text-xs text-gray-500">{item.name}</p>}
        </div>
        <StatusBadge
          status={ROLE_VARIANTS[item.role] ?? 'neutral'}
          label={ROLE_LABELS[item.role] ?? item.role}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{formatDate(item.createdAt)} · {item._count.orders} pesanan</span>
        <Button variant="ghost" size="sm" onClick={() => { setEditUser(item); setNewRole(item.role); }}>
          Ubah Role
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun, role, dan akses pengguna platform."
      />

      <div className="mt-6 w-full sm:w-72">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Cari email atau nama..."
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyState={{
            title: 'Tidak ada pengguna',
            description: 'Pengguna yang terdaftar akan muncul di sini.',
          }}
          mobileCardRender={mobileCardRender}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        title="Ubah Role Pengguna"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pengguna: <span className="font-semibold">{editUser?.email}</span>
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="role-select" className="text-sm font-medium text-gray-700">
              Role Baru
            </label>
            <select
              id="role-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditUser(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={roleLoading}
              onClick={handleRoleUpdate}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
