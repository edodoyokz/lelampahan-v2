'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TicketType {
  name: string;
  price: number;
  quota: number;
}

interface SessionData {
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookingCutoff: string;
  ticketTypes: TicketType[];
}

function emptyTicketType(): TicketType {
  return { name: 'Regular', price: 50000, quota: 0 };
}

function emptySession(): SessionData {
  return {
    startsAt: '',
    endsAt: '',
    capacity: 10,
    bookingCutoff: '',
    ticketTypes: [emptyTicketType()],
  };
}

export default function SessionsPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [sessions, setSessions] = useState<SessionData[]>([emptySession()]);
  const [status, setStatus] = useState<string | null>('Memuat sesi...');

  const loadSessions = useCallback(async () => {
    setStatus('Memuat sesi...');
    const response = await fetch(`/api/listing/${listingId}/sessions`, { cache: 'no-store' });
    if (!response.ok) {
      setStatus('Gagal memuat sesi.');
      return;
    }

    const data = await response.json();
    if (data.sessions?.length) {
      setSessions(
        data.sessions.map((session: any) => ({
          startsAt: session.startsAt ? new Date(session.startsAt).toISOString().slice(0, 16) : '',
          endsAt: session.endsAt ? new Date(session.endsAt).toISOString().slice(0, 16) : '',
          capacity: session.capacity,
          bookingCutoff: session.bookingCutoff
            ? new Date(session.bookingCutoff).toISOString().slice(0, 16)
            : '',
          ticketTypes: (session.ticketTypes ?? []).map((tt: any) => ({
            name: tt.name,
            price: tt.price,
            quota: tt.quota ?? 0,
          })),
        })),
      );
    }

    setStatus('');
  }, [listingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSessions();
  }, [loadSessions]);

  const addTicketType = (sessionIndex: number) => {
    const updated = [...sessions];
    updated[sessionIndex].ticketTypes.push(emptyTicketType());
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
    setSessions([...sessions, emptySession()]);
  };

  const handleSave = async () => {
    setStatus('Menyimpan sesi...');
    const response = await fetch(`/api/listing/${listingId}/sessions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessions: sessions.map((s) => ({
          startsAt: new Date(s.startsAt).toISOString(),
          endsAt: new Date(s.endsAt).toISOString(),
          capacity: s.capacity,
          bookingCutoff: new Date(s.bookingCutoff).toISOString(),
          ticketTypes: s.ticketTypes.map((tt) => ({
            name: tt.name,
            price: tt.price,
            quota: tt.quota || null,
          })),
        })),
      }),
    });

    if (!response.ok) {
      setStatus('Gagal menyimpan sesi.');
      return;
    }

    setStatus('Sesi berhasil disimpan ✅');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Sesi &amp; Tipe Tiket</h1>
      <p className="mt-1 text-sm text-gray-500">
        Listing ID: <code className="text-xs">{listingId}</code>
      </p>

      {status && (
        <p
          className={`mt-4 rounded-lg p-3 text-sm ${
            status.includes('✅')
              ? 'bg-green-50 text-green-800'
              : 'bg-blue-50 text-blue-800'
          }`}
        >
          {status}
        </p>
      )}

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
      </div>
    </div>
  );
}
