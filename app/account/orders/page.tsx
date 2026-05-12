'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { formatIDR } from '@/lib/format-currency';
import { formatOrderStatusLabel } from '@/lib/status-labels';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  session: {
    listing: {
      title: string;
      slug: string;
    };
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function OrderCardSkeleton() {
  return (
    <Card variant="outlined" padding="md">
      <div className="space-y-3">
        <SkeletonLoader variant="text" lines={1} />
        <SkeletonLoader variant="text" lines={2} />
      </div>
    </Card>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<OrderData | null>(null);
  const [refundOrder, setRefundOrder] = useState<OrderData | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/account/orders');
        if (!res.ok) {
          setError('Gagal memuat pesanan. Coba lagi beberapa saat lagi.');
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        setError('Gagal memuat pesanan. Coba lagi beberapa saat lagi.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleCancelOrder(order: OrderData) {
    setCancellingId(order.id);
    setConfirmCancelOrder(null);
    try {
      const res = await fetch(`/api/booking/${order.id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Gagal membatalkan pesanan.');
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch {
      setError('Gagal membatalkan pesanan. Coba lagi.');
    } finally {
      setCancellingId(null);
    }
  }

  function getActionButtons(order: OrderData) {
    if (order.status === 'PENDING_PAYMENT') {
      return (
        <div className="flex gap-2 flex-wrap">
          <Link href="/checkout/pending">
            <Button variant="primary" size="sm">Lanjutkan Pembayaran</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            loading={cancellingId === order.id}
            onClick={() => setConfirmCancelOrder(order)}
          >
            Batalkan
          </Button>
        </div>
      );
    }
    if (['PAID', 'COMPLETED'].includes(order.status)) {
      return (
        <div className="flex gap-2 flex-wrap">
          <Link href="/account/tickets">
            <Button variant="ghost" size="sm">Lihat Tiket</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setRefundOrder(order); setRefundReason(''); setError(''); }}
          >
            Ajukan Refund
          </Button>
        </div>
      );
    }
    return (
      <Link href={`/l/${order.session.listing.slug}`}>
        <Button variant="ghost" size="sm">Lihat Pengalaman</Button>
      </Link>
    );
  }

  return (
    <div>
      <PageHeader title="Pesanan Saya" description="Pantau status booking dan pembayaran Anda." />

      <div className="mt-6 space-y-4">
        {error ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        ) : loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : orders.length === 0 ? (
          <EmptyState
            illustration={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            title="Belum ada pesanan"
            description="Pesanan yang Anda buat akan muncul di sini."
            action={{ label: 'Jelajahi Pengalaman', href: '/' }}
          />
        ) : (
          orders.map((order) => (
            <Card key={order.id} variant="outlined" padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-lelampahan-earth truncate">
                    {order.session.listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(order.createdAt)} · {order.orderNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <StatusBadge
                    status={getStatusVariant(order.status)}
                    label={formatOrderStatusLabel(order.status)}
                  />
                  <span className="text-sm font-semibold text-lelampahan-earth">
                    {formatIDR(order.totalAmount)}
                  </span>
                  {getActionButtons(order)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        open={confirmCancelOrder !== null}
        onClose={() => setConfirmCancelOrder(null)}
        title="Batalkan Pesanan?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin membatalkan pesanan{' '}
            <span className="font-semibold">{confirmCancelOrder?.orderNumber}</span> untuk{' '}
            <span className="font-semibold">{confirmCancelOrder?.session.listing.title}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setConfirmCancelOrder(null)}>
              Kembali
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancellingId === confirmCancelOrder?.id}
              onClick={() => confirmCancelOrder && handleCancelOrder(confirmCancelOrder)}
            >
              Ya, Batalkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund request modal */}
      <Modal
        open={refundOrder !== null}
        onClose={() => setRefundOrder(null)}
        title="Ajukan Pengembalian Dana"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pesanan: <span className="font-semibold">{refundOrder?.orderNumber}</span> —{' '}
            {refundOrder?.session.listing.title}
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="refund-reason" className="text-sm font-medium text-gray-700">
              Alasan Refund
            </label>
            <textarea
              id="refund-reason"
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Jelaskan alasan pengajuan refund..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setRefundOrder(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={refundSubmitting}
              onClick={async () => {
                if (!refundOrder || refundReason.trim().length < 5) {
                  setError('Alasan refund minimal 5 karakter.');
                  return;
                }
                setRefundSubmitting(true);
                setError('');
                try {
                  const res = await fetch('/api/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId: refundOrder.id,
                      amount: refundOrder.totalAmount,
                      reason: refundReason.trim(),
                    }),
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    setError(data.error ?? 'Gagal mengajukan refund.');
                    return;
                  }
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === refundOrder.id ? { ...o, status: 'REFUND_REQUESTED' } : o
                    )
                  );
                  setRefundOrder(null);
                } catch {
                  setError('Terjadi kesalahan. Coba lagi.');
                } finally {
                  setRefundSubmitting(false);
                }
              }}
            >
              Kirim Pengajuan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
