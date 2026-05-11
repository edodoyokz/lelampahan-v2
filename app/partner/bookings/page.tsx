'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatIDR } from '@/lib/format-currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

interface BookingItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  participants?: Array<{ name: string; email?: string }>;
  session?: { listing?: { title: string } };
  reservation?: { status: string } | null;
}

type ModalAction = {
  id: string;
  action: 'approve' | 'reject';
  orderNumber: string;
} | null;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await fetch('/api/partner/bookings', { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) setError('Akun belum terhubung ke partner.');
      else setError('Gagal memuat pesanan.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    setBookings(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBookings();
  }, [loadBookings]);

  const handleAction = async () => {
    if (!modalAction) return;

    setActionLoading(true);
    const response = await fetch(`/api/booking/${modalAction.id}/${modalAction.action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      setError('Gagal menyimpan keputusan.');
      setActionLoading(false);
      setModalAction(null);
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === modalAction.id
          ? { ...b, status: modalAction.action === 'approve' ? 'PARTNER_APPROVED' : 'PARTNER_REJECTED' }
          : b,
      ),
    );
    setActionLoading(false);
    setModalAction(null);
  };

  const columns: Column<BookingItem>[] = [
    {
      key: 'orderNumber',
      header: 'Order Number',
      render: (item) => (
        <span className="font-mono text-xs">{item.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Pelanggan',
      render: (item) => (
        <span className="text-gray-700">
          {item.participants?.[0]?.name ?? item.participants?.[0]?.email ?? '-'}
        </span>
      ),
    },
    {
      key: 'listing',
      header: 'Listing',
      render: (item) => (
        <span className="text-gray-600">{item.session?.listing?.title ?? '-'}</span>
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
      key: 'total',
      header: 'Total',
      render: (item) => (
        <span className="text-gray-700">
          {formatIDR(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === 'REQUESTED' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setModalAction({ id: item.id, action: 'approve', orderNumber: item.orderNumber })
                }
              >
                Setujui
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setModalAction({ id: item.id, action: 'reject', orderNumber: item.orderNumber })
                }
              >
                Tolak
              </Button>
            </>
          )}
          {item.status === 'PENDING_PAYMENT' && item.reservation?.status === 'ACTIVE' && (
            <span className="text-xs text-gray-500">Menunggu pembayaran</span>
          )}
        </div>
      ),
    },
  ];

  const mobileCardRender = (item: BookingItem) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-900">{item.orderNumber}</span>
        <StatusBadge status={getStatusVariant(item.status)} label={item.status} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">
          {item.participants?.[0]?.name ?? item.participants?.[0]?.email ?? '-'}
        </p>
        <p className="text-xs text-gray-500">{item.session?.listing?.title ?? '-'}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {formatIDR(item.totalAmount)}
        </span>
        {item.status === 'REQUESTED' && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setModalAction({ id: item.id, action: 'approve', orderNumber: item.orderNumber })
              }
            >
              Setujui
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setModalAction({ id: item.id, action: 'reject', orderNumber: item.orderNumber })
              }
            >
              Tolak
            </Button>
          </div>
        )}
        {item.status === 'PENDING_PAYMENT' && item.reservation?.status === 'ACTIVE' && (
          <span className="text-xs text-gray-500">Menunggu pembayaran</span>
        )}
      </div>
    </div>
  );

  const requestedCount = bookings.filter((booking) => booking.status === 'REQUESTED').length;
  const pendingPaymentCount = bookings.filter((booking) => booking.status === 'PENDING_PAYMENT').length;
  const approvedCount = bookings.filter((booking) => ['PARTNER_APPROVED', 'PAID', 'COMPLETED'].includes(booking.status)).length;

  return (
    <div>
      <PageHeader title="Pesanan & Permintaan Booking" description="Kelola pesanan masuk dan request-to-book." />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Permintaan" value={requestedCount} />
        <StatCard label="Menunggu Pembayaran" value={pendingPaymentCount} />
        <StatCard label="Disetujui/Selesai" value={approvedCount} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          emptyState={{
            title: 'Belum ada pesanan',
            description: 'Pesanan dari pelanggan akan muncul di sini.',
          }}
          mobileCardRender={mobileCardRender}
        />
      </div>

      <Modal
        open={modalAction !== null}
        onClose={() => setModalAction(null)}
        title={
          modalAction?.action === 'approve'
            ? 'Setujui Pesanan'
            : 'Tolak Pesanan'
        }
        description={
          modalAction?.action === 'approve'
            ? `Apakah Anda yakin ingin menyetujui pesanan ${modalAction?.orderNumber ?? ''}?`
            : `Apakah Anda yakin ingin menolak pesanan ${modalAction?.orderNumber ?? ''}? Tindakan ini tidak dapat dibatalkan.`
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

      {/* Hidden loading overlay for action in progress */}
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
