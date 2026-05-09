'use client';

import { useState } from 'react';

type ListingType = 'TOUR' | 'EVENT';
type BookingMode = 'INSTANT_CONFIRMATION' | 'REQUEST_TO_BOOK';

export default function NewListingPage() {
  const [type, setType] = useState<ListingType>('TOUR');
  const [bookingMode, setBookingMode] = useState<BookingMode>('INSTANT_CONFIRMATION');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [venue, setVenue] = useState('');
  const [itinerary, setItinerary] = useState<Array<{ time: string; activity: string }>>([
    { time: '', activity: '' },
  ]);
  const [sessions, setSessions] = useState<
    Array<{ startsAt: string; endsAt: string; capacity: number; price: number }>
  >([{ startsAt: '', endsAt: '', capacity: 10, price: 50000 }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addItineraryItem = () => {
    setItinerary([...itinerary, { time: '', activity: '' }]);
  };

  const updateItinerary = (index: number, field: 'time' | 'activity', value: string) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const addSession = () => {
    setSessions([...sessions, { startsAt: '', endsAt: '', capacity: 10, price: 50000 }]);
  };

  const updateSession = (index: number, field: string, value: string | number) => {
    const updated = [...sessions];
    (updated[index] as any)[field] = value;
    setSessions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const body = {
      title,
      type,
      description,
      bookingMode,
      partnerId: 'p1',
      timezone: 'Asia/Jakarta',
      tourDetails:
        type === 'TOUR'
          ? {
              duration,
              meetingPoint,
              itinerary: itinerary.filter((i) => i.time && i.activity),
            }
          : undefined,
      eventDetails: type === 'EVENT' ? { venue } : undefined,
    };

    try {
      const res = await fetch('/api/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setResult('Listing berhasil dibuat ✅');
        setTitle('');
        setDescription('');
        setDuration('');
        setMeetingPoint('');
        setVenue('');
        setItinerary([{ time: '', activity: '' }]);
        setSessions([{ startsAt: '', endsAt: '', capacity: 10, price: 50000 }]);
      } else {
        const err = await res.json();
        setResult(`Gagal: ${err.error || 'Unknown error'}`);
      }
    } catch {
      setResult('Gagal terhubung ke server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Buat Listing Baru</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-6">
        {/* Type Toggle */}
        <div>
          <label className="text-sm font-medium text-gray-700">Tipe Listing</label>
          <div className="mt-1 flex gap-4">
            <button
              type="button"
              onClick={() => setType('TOUR')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                type === 'TOUR'
                  ? 'bg-lelampahan-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tour
            </button>
            <button
              type="button"
              onClick={() => setType('EVENT')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                type === 'EVENT'
                  ? 'bg-lelampahan-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Event
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Judul Listing
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
            placeholder="Contoh: Jelajah Kotagede Heritage"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
            placeholder="Deskripsikan tour atau event Anda..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Mode Booking</label>
          <div className="mt-1 flex gap-4">
            <button
              type="button"
              onClick={() => setBookingMode('INSTANT_CONFIRMATION')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                bookingMode === 'INSTANT_CONFIRMATION'
                  ? 'bg-lelampahan-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Instant Confirmation
            </button>
            <button
              type="button"
              onClick={() => setBookingMode('REQUEST_TO_BOOK')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                bookingMode === 'REQUEST_TO_BOOK'
                  ? 'bg-lelampahan-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Request to Book
            </button>
          </div>
        </div>

        {type === 'TOUR' && (
          <>
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Durasi
              </label>
              <input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2"
                placeholder="Contoh: 4 jam"
              />
            </div>
            <div>
              <label htmlFor="meetingPoint" className="text-sm font-medium text-gray-700">
                Titik Kumpul
              </label>
              <input
                id="meetingPoint"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2"
                placeholder="Contoh: Pasar Kotagede"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Itinerary</label>
              {itinerary.map((item, i) => (
                <div key={i} className="mt-2 flex gap-2">
                  <input
                    placeholder="Jam"
                    value={item.time}
                    onChange={(e) => updateItinerary(i, 'time', e.target.value)}
                    className="w-24 rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Aktivitas"
                    value={item.activity}
                    onChange={(e) => updateItinerary(i, 'activity', e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addItineraryItem}
                className="mt-2 text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
              >
                + Tambah item itinerary
              </button>
            </div>
          </>
        )}

        {type === 'EVENT' && (
          <div>
            <label htmlFor="venue" className="text-sm font-medium text-gray-700">
              Venue / Lokasi
            </label>
            <input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2"
              placeholder="Contoh: Taman Budaya Yogyakarta"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Sesi & Harga</label>
          {sessions.map((session, i) => (
            <div key={i} className="mt-2 rounded-lg border bg-white p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-gray-500">Mulai</label>
                  <input
                    type="datetime-local"
                    value={session.startsAt}
                    onChange={(e) => updateSession(i, 'startsAt', e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Selesai</label>
                  <input
                    type="datetime-local"
                    value={session.endsAt}
                    onChange={(e) => updateSession(i, 'endsAt', e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Kapasitas</label>
                  <input
                    type="number"
                    min={1}
                    value={session.capacity}
                    onChange={(e) => updateSession(i, 'capacity', parseInt(e.target.value) || 1)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Harga (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={session.price}
                    onChange={(e) => updateSession(i, 'price', parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSession}
            className="mt-2 text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
          >
            + Tambah sesi
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-lelampahan-gold px-6 py-3 font-medium text-white hover:bg-lelampahan-brick disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Buat Listing'}
        </button>

        {result && (
          <div
            className={`rounded-lg p-4 text-sm ${
              result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {result}
          </div>
        )}
      </form>
    </div>
  );
}
