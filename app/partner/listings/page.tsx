'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PartnerListing {
  id: string;
  title: string;
  type: string;
  status: string;
  _count?: { sessions: number };
}

export default function ListingManagement() {
  const [listings, setListings] = useState<PartnerListing[]>([]);
  const [partnerId, setPartnerId] = useState('p1');
  const [status, setStatus] = useState('Masukkan Partner ID lalu muat listing.');

  const loadListings = async () => {
    setStatus('Memuat listing partner...');
    const response = await fetch(`/api/partner/${partnerId}/listings`, { cache: 'no-store' });
    if (!response.ok) {
      setStatus(response.status === 401 ? 'Login diperlukan.' : 'Gagal memuat listing partner.');
      return;
    }

    const data = await response.json();
    setListings(data.listings ?? []);
    setStatus('');
  };

  useEffect(() => {
    void loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lelampahan-earth">Listings</h1>
          <div className="mt-3 flex items-center gap-2">
            <input value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" placeholder="Partner ID" />
            <button onClick={loadListings} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">Muat</button>
          </div>
        </div>
        <Link href="/partner/listings/new" className="rounded-lg bg-lelampahan-gold px-4 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick">
          + Listing Baru
        </Link>
      </div>

      {status && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Judul</th>
              <th className="px-6 py-3 font-medium">Tipe</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Sesi</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{listing.title}</td>
                <td className="px-6 py-4 text-gray-500">{listing.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : listing.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{listing._count?.sessions ?? 0}</td>
                <td className="px-6 py-4">
                  <Link href={`/partner/listings/${listing.id}`} className="text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {listings.length === 0 && !status && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada listing.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
