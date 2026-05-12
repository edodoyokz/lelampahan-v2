'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { formatIDR } from '@/lib/format-currency';

interface SettlementData {
  id: string;
  status: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  partner: { name: string };
  payouts: Array<{ id: string; status: string; amount: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Terbuka',
  CLOSED: 'Ditutup',
  PAID: 'Dibayar',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settlements', { cache: 'no-store' });
        if (!res.ok) {
          setError('Gagal memuat data settlement.');
          return;
        }
        const data: SettlementData[] = await res.json();
        setSettlements(data);
      } catch {
        setError('Gagal memuat data settlement.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const columns: Column<SettlementData>[] = [
    {
      key: 'partner',
      header: 'Partner',
      render: (item) => <span className="font-medium text-gray-900">{item.partner.name}</span>,
    },
    {
      key: 'period',
      header: 'Periode',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {formatDate(item.periodStart)} – {formatDate(item.periodEnd)}
        </span>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Gross',
      render: (item) => <span className="text-sm">{formatIDR(item.grossAmount)}</span>,
    },
    {
      key: 'platformFee',
      header: 'Fee Platform',
      render: (item) => <span className="text-sm text-gray-500">{formatIDR(item.platformFee)}</span>,
    },
    {
      key: 'netAmount',
      header: 'Net',
      render: (item) => <span className="text-sm font-semibold">{formatIDR(item.netAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={STATUS_LABELS[item.status] ?? item.status}
        />
      ),
    },
  ];

  const mobileCardRender = (item: SettlementData) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{item.partner.name}</p>
          <p className="text-xs text-gray-500">
            {formatDate(item.periodStart)} – {formatDate(item.periodEnd)}
          </p>
        </div>
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={STATUS_LABELS[item.status] ?? item.status}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">Gross</p>
          <p className="font-medium">{formatIDR(item.grossAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fee</p>
          <p className="font-medium text-gray-500">{formatIDR(item.platformFee)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Net</p>
          <p className="font-semibold">{formatIDR(item.netAmount)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Settlement Partner"
        description="Ringkasan pembayaran yang perlu diselesaikan ke partner."
      />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={settlements}
          loading={loading}
          emptyState={{
            title: 'Tidak ada settlement terbuka',
            description: 'Settlement akan muncul setelah ada transaksi yang perlu diselesaikan.',
          }}
          mobileCardRender={mobileCardRender}
        />
      </div>
    </div>
  );
}
