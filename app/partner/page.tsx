'use client';

import { useEffect, useState } from 'react';

interface PartnerContext {
  role: string;
  partner: { id: string; name: string; status: string };
}

export default function PartnerDashboard() {
  const [context, setContext] = useState<PartnerContext | null>(null);
  const [activeListings, setActiveListings] = useState(0);
  const [status, setStatus] = useState('Memuat konteks partner...');

  useEffect(() => {
    async function loadDashboard() {
      const contextResponse = await fetch('/api/partner/me', { cache: 'no-store' });
      if (!contextResponse.ok) {
        setStatus(contextResponse.status === 404 ? 'Akun belum terhubung ke partner.' : 'Login partner diperlukan.');
        return;
      }

      const partnerContext = await contextResponse.json();
      setContext(partnerContext);

      const listingsResponse = await fetch(`/api/partner/${partnerContext.partner.id}/listings`, { cache: 'no-store' });
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        setActiveListings(
          (listingsData.listings ?? []).filter((listing: { status: string }) => listing.status === 'PUBLISHED').length,
        );
      }

      setStatus('');
    }

    void loadDashboard();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <p className="mt-1 text-sm text-gray-500">
        {context ? `${context.partner.name} · ${context.role} · ${context.partner.status}` : 'Selamat datang di portal partner Lelampahan.'}
      </p>
      {status && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings Aktif</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">{activeListings}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pesanan Bulan Ini</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pendapatan (Estimasi)</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp 0</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a href="/partner/listings/new" className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold">
          <h3 className="font-semibold text-lelampahan-earth">Buat Listing Baru</h3>
          <p className="mt-1 text-sm text-gray-500">Tambahkan tour atau event baru</p>
        </a>
        <a href="/partner/listings" className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold">
          <h3 className="font-semibold text-lelampahan-earth">Kelola Listings</h3>
          <p className="mt-1 text-sm text-gray-500">Lihat dan edit listing yang sudah ada</p>
        </a>
      </div>
    </div>
  );
}
