'use client';

import { useState } from 'react';

interface Booking {
  id: string;
  orderNumber: string;
  customerName: string;
  listingTitle: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings] = useState<Booking[]>([
    {
      id: 'b1',
      orderNumber: 'LM-20260509-ABCD',
      customerName: 'Budi Santoso',
      listingTitle: 'Jelajah Kotagede Heritage',
      status: 'PAID',
      totalAmount: 100000,
      createdAt: '2026-05-09',
    },
    {
      id: 'b2',
      orderNumber: 'LM-20260509-EFGH',
      customerName: 'Siti Rahayu',
      listingTitle: 'Workshop Batik',
      status: 'REQUESTED',
      totalAmount: 50000,
      createdAt: '2026-05-09',
    },
  ]);

  const handleApprove = async (id: string) => {
    console.log('Approve booking:', id);
  };

  const handleReject = async (id: string) => {
    console.log('Reject booking:', id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Pesanan &amp; Permintaan Booking</h1>
      <p className="mt-1 text-sm text-gray-500">Kelola pesanan masuk dan request-to-book.</p>

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
                <td className="px-6 py-4 text-gray-700">{b.customerName}</td>
                <td className="px-6 py-4 text-gray-500">{b.listingTitle}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'REQUESTED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">Rp {b.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {b.status === 'REQUESTED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Tolak
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
