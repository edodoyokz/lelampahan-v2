'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';

interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DEFAULT_PAGE_SIZE = 50;

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  async function loadLogs() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (actionFilter.trim()) params.set('action', actionFilter.trim());
      params.set('page', String(page));
      params.set('pageSize', String(DEFAULT_PAGE_SIZE));
      const res = await fetch(`/api/admin/audit?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Gagal memuat audit log.');
        return;
      }
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotalItems(data.total ?? 0);
    } catch {
      setError('Gagal memuat audit log.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLogs();
  }, [page, actionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Waktu',
      render: (item) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (item) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{item.action}</span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entitas',
      render: (item) => (
        <span className="text-sm text-gray-700">{item.entityType}</span>
      ),
    },
    {
      key: 'entityId',
      header: 'ID',
      render: (item) => (
        <span className="font-mono text-xs text-gray-500 truncate max-w-[120px] block">{item.entityId}</span>
      ),
    },
    {
      key: 'actorUserId',
      header: 'Aktor',
      render: (item) => (
        <span className="font-mono text-xs text-gray-500 truncate max-w-[120px] block">
          {item.actorUserId ?? 'system'}
        </span>
      ),
    },
  ];

  const mobileCardRender = (item: AuditLog) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{item.action}</span>
        <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-700">
        {item.entityType} · <span className="font-mono text-xs">{item.entityId}</span>
      </p>
      {item.actorUserId && (
        <p className="text-xs text-gray-500">Aktor: {item.actorUserId}</p>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Audit Aktivitas"
        description="Log semua aksi penting yang terjadi di platform."
      />

      <div className="mt-6 w-full sm:w-72">
        <SearchInput
          value={actionFilter}
          onChange={(value) => { setActionFilter(value); setPage(1); }}
          placeholder="Filter berdasarkan aksi..."
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyState={{
            title: 'Tidak ada log audit',
            description: 'Aktivitas platform akan tercatat di sini.',
          }}
          mobileCardRender={mobileCardRender}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
