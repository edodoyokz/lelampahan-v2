'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';
import { formatIDR } from '@/lib/format-currency';
import { useToast } from '@/components/ui/toast';

interface RefundData {
  id: string;
  status: string;
  amount: number;
  reason: string;
  createdAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    session?: {
      listing?: { title: string };
    };
  };
}

type ModalAction = 'approve' | 'reject';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const REFUND_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Diajukan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PROCESSING: 'Diproses',
  REFUNDED: 'Selesai',
  FAILED: 'Gagal',
};

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>('approve');
  const [selected, setSelected] = useState<RefundData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  async function loadRefunds() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/refund', { cache: 'no-store' });
      if (!res.ok) {
        setError('Gagal memuat data refund.');
        return;
      }
      const data: RefundData[] = await res.json();
      setRefunds(data);
    } catch {
      setError('Gagal memuat data refund.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRefunds();
  }, []);

  const filtered = statusFilter === 'ALL'
    ? refunds
    : refunds.filter((r) => r.status === statusFilter);

  function openModal(refund: RefundData, action: ModalAction) {
    setSelected(refund);
    setModalAction(action);
    setModalOpen(true);
  }

  async function handleConfirm() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/refund/${selected.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: modalAction }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast({ type: 'error', message: data.error ?? 'Gagal memproses keputusan.' });
        setModalOpen(false);
        return;
      }

      const newStatus = modalAction === 'approve' ? 'APPROVED' : 'REJECTED';
      setRefunds((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, status: newStatus } : r))
      );
      showToast({
        type: 'success',
        message: `Refund ${modalAction === 'approve' ? 'disetujui' : 'ditolak'} untuk pesanan ${selected.order.orderNumber}.`,
      });
    } catch {
      showToast({ type: 'error', message: 'Terjadi kesalahan.' });
    } finally {
      setActionLoading(false);
      setModalOpen(false);
      setSelected(null);
    }
  }

  const columns: Column<RefundData>[] = [
    {
      key: 'order',
      header: 'Pesanan',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.order.orderNumber}</p>
          <p className="text-xs text-gray-500">{item.order.session?.listing?.title ?? '-'}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item) => (
        <span className="font-medium">{formatIDR(item.amount)}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Alasan',
      render: (item) => (
        <span className="text-sm text-gray-600 line-clamp-2">{item.reason}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={REFUND_STATUS_LABELS[item.status] ?? item.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) =>
        item.status === 'REQUESTED' ? (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => openModal(item, 'approve')}>
              Setujui
            </Button>
            <Button variant="destructive" size="sm" onClick={() => openModal(item, 'reject')}>
              Tolak
            </Button>
          </div>
        ) : null,
    },
  ];

  const mobileCardRender = (item: RefundData) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{item.order.orderNumber}</p>
          <p className="text-xs text-gray-500">{item.order.session?.listing?.title ?? '-'}</p>
        </div>
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={REFUND_STATUS_LABELS[item.status] ?? item.status}
        />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">{formatIDR(item.amount)}</span>
        <span className="text-gray-500">{formatDate(item.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-600">{item.reason}</p>
      {item.status === 'REQUESTED' && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button variant="primary" size="sm" onClick={() => openModal(item, 'approve')}>
            Setujui
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openModal(item, 'reject')}>
            Tolak
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Pengembalian Dana" description="Tinjau dan proses permintaan refund dari pelanggan." />

      <div className="mt-6">
        <StatusFilterTabs
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'ALL' },
            { label: 'Diajukan', value: 'REQUESTED' },
            { label: 'Disetujui', value: 'APPROVED' },
            { label: 'Ditolak', value: 'REJECTED' },
          ]}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyState={{
            title: 'Tidak ada permintaan refund',
            description: 'Permintaan refund dari pelanggan akan muncul di sini.',
          }}
          mobileCardRender={mobileCardRender}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        title={modalAction === 'approve' ? 'Setujui Refund?' : 'Tolak Refund?'}
        description={
          modalAction === 'approve'
            ? `Setujui pengembalian dana ${selected ? formatIDR(selected.amount) : ''} untuk pesanan ${selected?.order.orderNumber}?`
            : `Tolak permintaan refund untuk pesanan ${selected?.order.orderNumber}?`
        }
        actions={{
          confirm: {
            label: modalAction === 'approve' ? 'Setujui' : 'Tolak',
            variant: modalAction === 'approve' ? 'primary' : 'destructive',
            onClick: handleConfirm,
          },
          cancel: { label: 'Batal' },
        }}
      />
    </div>
  );
}
