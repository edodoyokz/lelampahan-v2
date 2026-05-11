'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';

interface AdminListing {
  id: string;
  title: string;
  type: string;
  status: string;
  partner?: { name: string };
  _count?: { sessions: number };
}

type ModalAction = 'approve' | 'reject';

export default function AdminListingPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>('approve');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadListings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/listings', { cache: 'no-store' });
      if (!response.ok) {
        setError(
          response.status === 401 || response.status === 403
            ? 'Akses admin diperlukan.'
            : 'Gagal memuat listing.'
        );
        return;
      }
      const data = await response.json();
      setListings(data.listings ?? []);
    } catch {
      setError('Gagal memuat listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadListings();
  }, []);

  const openModal = (listing: AdminListing, action: ModalAction) => {
    setSelectedListing(listing);
    setModalAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedListing(null);
    setActionLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedListing) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/listings/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: selectedListing.id, action: modalAction }),
      });

      if (!response.ok) {
        setError('Gagal menyimpan keputusan review.');
        closeModal();
        return;
      }

      setListings((prev) =>
        prev.map((l) =>
          l.id === selectedListing.id
            ? { ...l, status: modalAction === 'approve' ? 'PUBLISHED' : 'REJECTED' }
            : l
        )
      );
      closeModal();
    } catch {
      setError('Gagal menyimpan keputusan review.');
      closeModal();
    }
  };

  const columns: Column<AdminListing>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      key: 'partner',
      header: 'Partner',
      render: (item) => (
        <span className="text-gray-600">{item.partner?.name ?? '-'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item) => <span className="text-gray-600">{item.type}</span>,
    },
    {
      key: 'sessions',
      header: 'Sesi',
      render: (item) => (
        <span className="text-gray-600">{item._count?.sessions ?? 0}</span>
      ),
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
      render: (item) =>
        item.status === 'PENDING_REVIEW' ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal(item, 'approve')}
            >
              Setujui
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openModal(item, 'reject')}
            >
              Tolak
            </Button>
          </div>
        ) : null,
    },
  ];

  const mobileCardRender = (item: AdminListing) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-500">{item.partner?.name ?? '-'}</p>
        </div>
        <StatusBadge status={getStatusVariant(item.status)} label={item.status} />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Tipe: {item.type}</span>
        <span>Sesi: {item._count?.sessions ?? 0}</span>
      </div>
      {item.status === 'PENDING_REVIEW' && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal(item, 'approve')}
          >
            Setujui
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openModal(item, 'reject')}
          >
            Tolak
          </Button>
        </div>
      )}
    </div>
  );

  const filteredListings = statusFilter === 'ALL' ? listings : listings.filter((listing) => listing.status === statusFilter);

  return (
    <div>
      <PageHeader title="Review Pengalaman" description="Tinjau pengalaman yang menunggu persetujuan." />

      <div className="mt-6">
        <StatusFilterTabs
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'ALL' },
            { label: 'Review', value: 'PENDING_REVIEW' },
            { label: 'Terbit', value: 'PUBLISHED' },
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
          data={filteredListings}
          loading={loading}
          emptyState={{
            title: 'Tidak ada item yang menunggu review',
            description: 'Semua listing sudah direview.',
          }}
          mobileCardRender={mobileCardRender}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          modalAction === 'approve'
            ? 'Konfirmasi Persetujuan'
            : 'Konfirmasi Penolakan'
        }
        description={
          modalAction === 'approve'
            ? `Apakah Anda yakin ingin menyetujui pengalaman "${selectedListing?.title}"? Pengalaman akan tampil di marketplace.`
            : `Apakah Anda yakin ingin menolak pengalaman "${selectedListing?.title}"? Pengalaman tidak akan dipublikasikan.`
        }
        actions={{
          confirm: {
            label: modalAction === 'approve' ? 'Setujui' : 'Tolak',
            variant: modalAction === 'approve' ? 'primary' : 'destructive',
            onClick: handleConfirm,
          },
          cancel: {
            label: 'Batal',
            onClick: closeModal,
          },
        }}
      />
    </div>
  );
}
