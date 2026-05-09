'use client';

import { useEffect, useState } from 'react';

interface PartnerCapability {
  type: string;
  status: string;
}

interface Partner {
  id: string;
  name: string;
  description?: string | null;
  capabilities: PartnerCapability[];
  status: string;
}

export default function AdminPartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [status, setStatus] = useState('Memuat partner...');

  const loadPartners = async () => {
    const response = await fetch('/api/admin/partners', { cache: 'no-store' });
    if (!response.ok) {
      setStatus(response.status === 401 || response.status === 403 ? 'Akses admin diperlukan.' : 'Gagal memuat partner.');
      return;
    }

    const data = await response.json();
    setPartners(data.partners ?? []);
    setStatus('');
  };

  useEffect(() => {
    void loadPartners();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const response = await fetch('/api/admin/partners/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: id, action }),
    });

    if (!response.ok) {
      setStatus('Gagal menyimpan keputusan partner.');
      return;
    }

    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : p)),
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Partner Approval</h1>
      <p className="mt-1 text-sm text-gray-500">Review dan approve pendaftaran partner baru.</p>
      {status && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Deskripsi</th>
              <th className="px-6 py-3 font-medium">Kapabilitas</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{partner.name}</td>
                <td className="px-6 py-4 text-gray-500">{partner.description ?? '-'}</td>
                <td className="px-6 py-4 text-gray-500">
                  {partner.capabilities.map((cap) => `${cap.type} (${cap.status})`).join(', ')}
                </td>
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
                      <button onClick={() => handleAction(partner.id, 'approve')} className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => handleAction(partner.id, 'reject')} className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {partners.length === 0 && !status && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada partner.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
