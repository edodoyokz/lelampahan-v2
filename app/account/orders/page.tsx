'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { formatIDR } from '@/lib/format-currency';

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

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  COMPLETED: 'Selesai',
  EXPIRED: 'Kedaluwarsa',
  CANCELLED: 'Dibatalkan',
  REFUND_REQUESTED: 'Pengembalian Dana Diajukan',
  REFUND_REJECTED: 'Pengembalian Dana Ditolak',
  PARTIALLY_REFUNDED: 'Sebagian Dana Dikembalikan',
  REFUNDED: 'Dana Dikembalikan',
  NEEDS_ADMIN_REVIEW: 'Ditinjau Admin',
};

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

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/account/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }
      } catch {
        // silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Pesanan Saya</h1>

      <div className="mt-6 space-y-4">
        {loading ? (
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
                    label={statusLabels[order.status] ?? order.status}
                  />
                  <span className="text-sm font-semibold text-lelampahan-earth">
                    {formatIDR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
