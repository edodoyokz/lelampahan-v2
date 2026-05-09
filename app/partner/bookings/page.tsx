'use client';

import { useCallback, useEffect, useState } from 'react';

interface BookingItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  participants?: Array<{ name: string }>;
  session?: { listing?: { title: string } };
  reservation?: { status: string } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [status, setStatus] = useState('Memuat pesanan...');

  const loadBookings = useCallback(async () => {
    setStatus('Memuat pesanan...');
    const response = await fetch('/api/partner/bookings', { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) setStatus('Akun belum terhubung ke partner.');
      else setStatus('Gagal memuat pesanan.');
      return;
    }

    const data = await response.json();
    setBookings(data.orders ?? []);
    setStatus('');
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const response = await fetch(`/api/booking/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      setStatus('Gagal menyimpan keputusan.');
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: action === 'approve' ? 'PARTNER_APPROVED' : 'PARTNER_REJECTED' }
          : b,
      ),
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Pesanan &amp; Permintaan Booking</h1>
      <p className="mt-1 text-sm text-gray-500">Kelola pesanan masuk dan request-to-book.</p>
      {status && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Pelanggan</th>
              <th className="px-6 py-3 font-medium">Listing</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-900">{b.orderNumber}</td>
                <td className="px-6 py-4 text-gray-700">
                  {b.participants?.[0]?.name ?? '-'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {b.session?.listing?.title ?? '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'PENDING_PAYMENT'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'REQUESTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  Rp {b.totalAmount.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  {b.status === 'REQUESTED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(b.id, 'approve')}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleAction(b.id, 'reject')}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                  {b.status === 'PENDING_PAYMENT' && b.reservation?.status === 'ACTIVE' && (
                    <span className="text-xs text-gray-500">Menunggu pembayaran</span>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && !status && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
