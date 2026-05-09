'use client';

import { useState } from 'react';

interface Partner {
  id: string;
  name: string;
  email: string;
  capabilities: string[];
  status: string;
}

export default function AdminPartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([
    { id: 'p1', name: 'Jogja Adventure', email: 'info@jogjaadventure.com', capabilities: ['TOURS'], status: 'PENDING_REVIEW' },
    { id: 'p2', name: 'Komunitas Seni Jogja', email: 'komunitas@senijogja.com', capabilities: ['EVENTS'], status: 'PENDING_REVIEW' },
  ]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : p)),
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Partner Approval</h1>
      <p className="mt-1 text-sm text-gray-500">Review dan approve pendaftaran partner baru.</p>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Kapabilitas</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{partner.name}</td>
                <td className="px-6 py-4 text-gray-500">{partner.email}</td>
                <td className="px-6 py-4 text-gray-500">{partner.capabilities.join(', ')}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      partner.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : partner.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {partner.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {partner.status === 'PENDING_REVIEW' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(partner.id, 'approve')}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(partner.id, 'reject')}
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
