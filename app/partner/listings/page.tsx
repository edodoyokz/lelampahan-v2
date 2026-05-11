'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';
import { PageHeader } from '@/components/ui/page-header';
import { formatListingStatusLabel } from '@/lib/status-labels';

interface PartnerListing {
  id: string;
  title: string;
  type: string;
  status: string;
  _count?: { sessions: number };
}

interface PartnerContext {
  role: string;
  partner: { id: string; name: string; status: string };
}

const DEFAULT_PAGE_SIZE = 20;

export default function ListingManagement() {
  const [listings, setPengalaman] = useState<PartnerListing[]>([]);
  const [context, setContext] = useState<PartnerContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadPengalaman = async () => {
    setLoading(true);
    setError(null);

    const contextResponse = await fetch('/api/partner/me', { cache: 'no-store' });
    if (!contextResponse.ok) {
      setError(
        contextResponse.status === 404
          ? 'Akun belum terhubung ke partner.'
          : 'Masuk sebagai partner diperlukan.'
      );
      setLoading(false);
      return;
    }

    const partnerContext = await contextResponse.json();
    setContext(partnerContext);

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(DEFAULT_PAGE_SIZE));
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    const response = await fetch(
      `/api/partner/${partnerContext.partner.id}/listings?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) {
      setError('Gagal memuat listing partner.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    setPengalaman(data.listings ?? []);
    setTotalItems(data.total ?? 0);
    setLoading(false);
  };

  const handleSubmit = async (listingId: string) => {
    setSubmittingId(listingId);
    try {
      const response = await fetch(`/api/listing/${listingId}/submit`, {
        method: 'POST',
      });
      if (response.ok) {
        await loadPengalaman();
      }
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPengalaman();
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: Column<PartnerListing>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item) => <span className="text-gray-600">{item.type}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={formatListingStatusLabel(item.status)}
        />
      ),
    },
    {
      key: 'sessions',
      header: 'Jumlah Sesi',
      render: (item) => (
        <span className="text-gray-600">{item._count?.sessions ?? 0}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Link href={`/partner/listings/${item.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
          {item.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              loading={submittingId === item.id}
              onClick={() => handleSubmit(item.id)}
            >
              Submit
            </Button>
          )}
        </div>
      ),
    },
  ];

  const mobileCardRender = (item: PartnerListing) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500">{item.type}</p>
        </div>
        <StatusBadge
          status={getStatusVariant(item.status)}
          label={formatListingStatusLabel(item.status)}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{item._count?.sessions ?? 0} sesi</span>
        <div className="flex items-center gap-2">
          <Link href={`/partner/listings/${item.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
          {item.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              loading={submittingId === item.id}
              onClick={() => handleSubmit(item.id)}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-lelampahan-earth">Pengalaman</h1>
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pengalaman" description={context ? `${context.partner.name} · ${context.role} · ${context.partner.status}` : 'Kelola pengalaman yang Anda tawarkan.'} action={{ label: '+ Listing Baru', href: '/partner/listings/new' }} />

      <div className="mt-6">
        <StatusFilterTabs
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={[
            { label: 'Semua', value: 'ALL' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Review', value: 'PENDING_REVIEW' },
            { label: 'Terbit', value: 'PUBLISHED' },
            { label: 'Ditolak', value: 'REJECTED' },
          ]}
        />
      </div>

      <div className="mt-6">
        <DataTable<PartnerListing>
          columns={columns}
          data={listings}
          loading={loading}
          mobileCardRender={mobileCardRender}
          emptyState={{
            title: 'Belum ada pengalaman',
            description:
              'Mulai buat pengalaman pertama Anda untuk menjangkau pelanggan.',
            action: {
              label: 'Buat Pengalaman Pertama',
              href: '/partner/listings/new',
            },
          }}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
