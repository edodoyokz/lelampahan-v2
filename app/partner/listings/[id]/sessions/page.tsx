'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface TicketType {
  name: string;
  price: number;
  quota: number;
}

export default function SessionsPage() {
  const params = useParams();
  const listingId = params.id as string;

  const [sessions, setSessions] = useState<
    Array<{
      startsAt: string;
      endsAt: string;
      capacity: number;
      bookingCutoff: string;
      ticketTypes: TicketType[];
    }>
  >([
    {
      startsAt: '',
      endsAt: '',
      capacity: 10,
      bookingCutoff: '',
      ticketTypes: [{ name: 'Regular', price: 50000, quota: 0 }],
    },
  ]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const addTicketType = (sessionIndex: number) => {
    const updated = [...sessions];
    updated[sessionIndex].ticketTypes.push({ name: '', price: 0, quota: 0 });
    setSessions(updated);
  };

  const updateTicketType = (
    sessionIndex: number,
    ticketIndex: number,
    field: keyof TicketType,
    value: string | number,
  ) => {
    const updated = [...sessions];
    (updated[sessionIndex].ticketTypes[ticketIndex] as any)[field] = value;
    setSessions(updated);
  };

  const addSession = () => {
    setSessions([
      ...sessions,
      {
        startsAt: '',
        endsAt: '',
        capacity: 10,
        bookingCutoff: '',
        ticketTypes: [{ name: 'Regular', price: 50000, quota: 0 }],
      },
    ]);
  };

  const handleSave = async () => {
    setStatusMessage('Disimpan (simulasi) — integrasi API menyusul ✅');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Sesi &amp; Tipe Tiket</h1>
      <p className="mt-1 text-sm text-gray-500">
        Listing ID: <code className="text-xs">{listingId}</code>
      </p>

      {sessions.map((session, sIdx) => (
        <div key={sIdx} className="mt-6 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-lelampahan-earth">Sesi {sIdx + 1}</h2>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs font-medium text-gray-500">Mulai</label>
              <input
                type="datetime-local"
                value={session.startsAt}
                onChange={(e) => {
                  const u = [...sessions];
                  u[sIdx].startsAt = e.target.value;
                  setSessions(u);
                }}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Selesai</label>
              <input
                type="datetime-local"
                value={session.endsAt}
                onChange={(e) => {
                  const u = [...sessions];
                  u[sIdx].endsAt = e.target.value;
                  setSessions(u);
                }}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Kapasitas</label>
              <input
                type="number"
                min={1}
                value={session.capacity}
                onChange={(e) => {
                  const u = [...sessions];
                  u[sIdx].capacity = parseInt(e.target.value) || 1;
                  setSessions(u);
                }}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Booking Cutoff</label>
              <input
                type="datetime-local"
                value={session.bookingCutoff}
                onChange={(e) => {
                  const u = [...sessions];
                  u[sIdx].bookingCutoff = e.target.value;
                  setSessions(u);
                }}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Tipe Tiket</h3>
            {session.ticketTypes.map((tt, tIdx) => (
              <div key={tIdx} className="mt-2 flex gap-3">
                <input
                  placeholder="Nama"
                  value={tt.name}
                  onChange={(e) => updateTicketType(sIdx, tIdx, 'name', e.target.value)}
                  className="flex-1 rounded border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Harga"
                  value={tt.price || ''}
                  onChange={(e) => updateTicketType(sIdx, tIdx, 'price', parseInt(e.target.value) || 0)}
                  className="w-28 rounded border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Kuota"
                  value={tt.quota || ''}
                  onChange={(e) => updateTicketType(sIdx, tIdx, 'quota', parseInt(e.target.value) || 0)}
                  className="w-20 rounded border px-3 py-2 text-sm"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTicketType(sIdx)}
              className="mt-2 text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
            >
              + Tambah tipe tiket
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSession}
        className="mt-4 text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
      >
        + Tambah sesi
      </button>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleSave}
          className="rounded-lg bg-lelampahan-gold px-6 py-2 font-medium text-white hover:bg-lelampahan-brick"
        >
          Simpan Semua
        </button>
        {statusMessage && <span className="text-sm text-green-700">{statusMessage}</span>}
      </div>
    </div>
  );
}
