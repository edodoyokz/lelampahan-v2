'use client';

import { useState } from 'react';

interface AdminListing {
  id: string;
  title: string;
  partnerName: string;
  type: string;
  status: string;
}

export default function AdminListingPage() {
  const [listings, setListings] = useState<AdminListing[]>([
    { id: 'l1', title: 'Jelajah Kotagede Heritage', partnerName: 'Jogja Adventure', type: 'TOUR', status: 'PENDING_REVIEW' },
    { id: 'l2', title: 'Workshop Batik', partnerName: 'Komunitas Seni Jogja', type: 'EVENT', status: 'PENDING_REVIEW' },
  ]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: action === 'approve' ? 'PUBLISHED' : 'REJECTED' } : l,
      ),
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Listing Review</h1>
      <p className="mt-1 text-sm text-gray-500">Review listing yang menunggu persetujuan.</p>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Judul</th>
              <th className="px-6 py-3 font-medium">Partner</th>
              <th className="px-6 py-3 font-medium">Tipe</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{l.title}</td>
                <td className="px-6 py-4 text-gray-500">{l.partnerName}</td>
                <td className="px-6 py-4 text-gray-500">{l.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      l.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : l.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {l.status === 'PENDING_REVIEW' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(l.id, 'approve')}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleAction(l.id, 'reject')}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
