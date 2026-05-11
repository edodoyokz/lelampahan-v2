'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';
import { SearchInput } from '@/components/ui/search-input';

interface PartnerCapability {
  type: string;
  status: string;
}

interface Partner {
  id: string;
  name: string;
  description?: string | null;
  capabilities: PartnerCapability[];
  status: string;
}

type ModalAction = {
  id: string;
  action: 'approve' | 'reject';
  name: string;
} | null;

const DEFAULT_PAGE_SIZE = 20;

export default function AdminPartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    params.set('page', String(page));
    params.set('pageSize', String(DEFAULT_PAGE_SIZE));
    const response = await fetch(`/api/admin/partners?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setError('Akses admin diperlukan.');
      } else {
        setError('Gagal memuat partner.');
      }
      setLoading(false);
      return;
    }

    const data = await response.json();
    setPartners(data.partners ?? []);
    setTotalItems(data.total ?? 0);
    setLoading(false);
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPartners();
  }, [loadPartners]);

  const handleAction = async () => {
    if (!modalAction) return;

    setActionLoading(true);
    const response = await fetch('/api/admin/partners/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: modalAction.id, action: modalAction.action }),
    });

    if (!response.ok) {
      setError('Gagal menyimpan keputusan partner.');
      setActionLoading(false);
      setModalAction(null);
      return;
    }

    setPartners((prev) =>
      prev.map((p) =>
        p.id === modalAction.id
          ? { ...p, status: modalAction.action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : p,
      ),
    );
    setActionLoading(false);
    setModalAction(null);
  };

  const columns: Column<Partner>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (item) => (
        <span className="text-gray-600 line-clamp-2">
          {item.description ?? '-'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'capabilities',
      header: 'Kapabilitas',
      render: (item) => (
        <span className="text-gray-600">
          {item.capabilities.length > 0
            ? item.capabilities.map((cap) => `${cap.type} (${cap.status})`).join(', ')
            : '-'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge status={getStatusVariant(item.status)} label={item.status} />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === 'PENDING_REVIEW' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setModalAction({ id: item.id, action: 'approve', name: item.name })
                }
              >
                Setujui
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setModalAction({ id: item.id, action: 'reject', name: item.name })
                }
              >
                Tolak
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const mobileCardRender = (item: Partner) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{item.name}</span>
        <StatusBadge status={getStatusVariant(item.status)} label={item.status} />
      </div>
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
      )}
      {item.capabilities.length > 0 && (
        <p className="text-xs text-gray-500">
          {item.capabilities.map((cap) => `${cap.type} (${cap.status})`).join(', ')}
        </p>
      )}
      {item.status === 'PENDING_REVIEW' && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setModalAction({ id: item.id, action: 'approve', name: item.name })
            }
          >
            Setujui
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setModalAction({ id: item.id, action: 'reject', name: item.name })
            }
          >
            Tolak
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Persetujuan Partner" description="Tinjau dan setujui pendaftaran partner baru." />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StatusFilterTabs
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={[
            { label: 'Semua', value: 'ALL' },
            { label: 'Review', value: 'PENDING_REVIEW' },
            { label: 'Disetujui', value: 'APPROVED' },
            { label: 'Ditolak', value: 'REJECTED' },
          ]}
        />
        <div className="w-full sm:w-64">
          <SearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            placeholder="Cari nama partner..."
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={partners}
          loading={loading}
          emptyState={{
            title: 'Tidak ada item yang menunggu review',
            description: 'Semua partner sudah direview.',
          }}
          mobileCardRender={mobileCardRender}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={modalAction !== null}
        onClose={() => setModalAction(null)}
        title={
          modalAction?.action === 'approve'
            ? 'Setujui Partner'
            : 'Tolak Partner'
        }
        description={
          modalAction?.action === 'approve'
            ? `Apakah Anda yakin ingin menyetujui partner "${modalAction?.name ?? ''}"?`
            : `Apakah Anda yakin ingin menolak partner "${modalAction?.name ?? ''}"? Tindakan ini tidak dapat dibatalkan.`
        }
        actions={{
          confirm: {
            label: modalAction?.action === 'approve' ? 'Setujui' : 'Tolak',
            variant: modalAction?.action === 'approve' ? 'primary' : 'destructive',
            onClick: handleAction,
          },
          cancel: {
            label: 'Batal',
          },
        }}
      />

      {actionLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <p className="text-sm text-gray-700">Memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
}
