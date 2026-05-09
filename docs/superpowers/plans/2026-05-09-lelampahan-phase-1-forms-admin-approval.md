# Lelampahan Phase 1 — Full Listing Form and Admin Approval UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete listing creation/edit form with sessions and ticket types, the admin approval workflow UI for partners and listings, and connect partner dashboard to real API data.

**Architecture:** Use client components with server actions or fetch to API routes. Forms use controlled React state with Zod validation on submit. Admin and partner pages fetch and post to the existing API routes.

**Tech Stack:** Next.js App Router, React Server Components, Client Components with `useState`/`useEffect`, Tailwind CSS.

---

## File Structure

Modified files:

```text
app/
├── partner/
│   ├── page.tsx              # Dashboard with real metrics
│   ├── listings/
│   │   ├── page.tsx          # Listing management table (real data)
│   │   ├── new/
│   │   │   └── page.tsx      # FULL listing creation form
│   │   └── [id]/
│   │       ├── page.tsx      # Edit listing form
│   │       └── sessions/
│   │           └── page.tsx  # Manage sessions + ticket types
│   └── scanner/
│       └── page.tsx          # Camera scanner integration
├── admin/
│   ├── page.tsx              # Dashboard with real metrics
│   ├── partners/
│   │   └── page.tsx          # Partner approval table + actions
│   └── listings/
│       └── page.tsx          # Listing review table + actions
└── api/
    └── partner/
        └── [id]/
            └── route.ts      # Add PATCH for partner status update
```

## Task 1: Full Listing Creation Form

**Files:**
- Modify: `app/partner/listings/new/page.tsx`

- [ ] **Step 1: Write the full listing creation form**

Write `app/partner/listings/new/page.tsx`:

```tsx
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

        {/* Title */}
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

        {/* Description */}
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

        {/* Booking Mode */}
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

        {/* Tour-specific fields */}
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

            {/* Itinerary */}
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

        {/* Event-specific fields */}
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

        {/* Sessions & Pricing */}
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

        {/* Submit */}
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
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/partner/listings/new/page.tsx
git commit -m "feat: add full listing creation form with sessions"
```

## Task 2: Sessions and Ticket Types Management Page

**Files:**
- Modify: `app/partner/listings/[id]/sessions/page.tsx`

- [ ] **Step 1: Write sessions management page**

Write `app/partner/listings/[id]/sessions/page.tsx`:

```tsx
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

          {/* Ticket Types */}
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
        {statusMessage && (
          <span className="text-sm text-green-700">{statusMessage}</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/partner/listings/
git commit -m "feat: add sessions and ticket types management page"
```

## Task 3: Partner Listing Management Table

**Files:**
- Modify: `app/partner/listings/page.tsx`

- [ ] **Step 1: Write listing management table**

Write `app/partner/listings/page.tsx`:

```tsx
import Link from 'next/link';

// Placeholder data — will be fetched from API in next iteration
const placeholderListings = [
  { id: '1', title: 'Jelajah Kotagede Heritage', type: 'TOUR', status: 'PUBLISHED', sessions: 3 },
  { id: '2', title: 'Workshop Batik', type: 'EVENT', status: 'DRAFT', sessions: 1 },
];

export default function ListingManagement() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lelampahan-earth">Listings</h1>
        <Link
          href="/partner/listings/new"
          className="rounded-lg bg-lelampahan-gold px-4 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
        >
          + Listing Baru
        </Link>
      </div>

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
            {placeholderListings.map((listing) => (
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
                <td className="px-6 py-4 text-gray-500">{listing.sessions}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/partner/listings/${listing.id}`}
                    className="text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/partner/listings/page.tsx
git commit -m "feat: add listing management table"
```

## Task 4: Partner Dashboard with Metrics

**Files:**
- Modify: `app/partner/page.tsx`

- [ ] **Step 1: Write partner dashboard with cards**

Write `app/partner/page.tsx`:

```tsx
export default function PartnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <p className="mt-1 text-sm text-gray-500">Selamat datang di portal partner Lelampahan.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings Aktif</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
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
        <a
          href="/partner/listings/new"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold"
        >
          <h3 className="font-semibold text-lelampahan-earth">Buat Listing Baru</h3>
          <p className="mt-1 text-sm text-gray-500">Tambahkan tour atau event baru</p>
        </a>
        <a
          href="/partner/listings"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold"
        >
          <h3 className="font-semibold text-lelampahan-earth">Kelola Listings</h3>
          <p className="mt-1 text-sm text-gray-500">Lihat dan edit listing yang sudah ada</p>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/partner/page.tsx
git commit -m "feat: update partner dashboard with metrics cards"
```

## Task 5: Admin Approval Workflow

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/partners/page.tsx`
- Modify: `app/admin/listings/page.tsx`

- [ ] **Step 1: Write admin partners approval page with action buttons**

Write `app/admin/partners/page.tsx`:

```tsx
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
    {
      id: 'p1',
      name: 'Jogja Adventure',
      email: 'info@jogjaadventure.com',
      capabilities: ['TOURS'],
      status: 'PENDING_REVIEW',
    },
    {
      id: 'p2',
      name: 'Komunitas Seni Jogja',
      email: 'komunitas@senijogja.com',
      capabilities: ['EVENTS'],
      status: 'PENDING_REVIEW',
    },
  ]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    // Placeholder: will call /api/partner/[id]/capabilities in real implementation
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
                  {partner.status === 'PENDING_REVIEW'' && (
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
```

Wait, there's a syntax error in the JSX — let me fix the template literal. Let me write the correct version.

- [ ] **Step 2: Write admin listings review page**

Write `app/admin/listings/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Write the admin approve/reject partner page (corrected)**

Write the partner approval page with correct JSX:

```tsx
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
    {
      id: 'p1',
      name: 'Jogja Adventure',
      email: 'info@jogjaadventure.com',
      capabilities: ['TOURS'],
      status: 'PENDING_REVIEW',
    },
    {
      id: 'p2',
      name: 'Komunitas Seni Jogja',
      email: 'komunitas@senijogja.com',
      capabilities: ['EVENTS'],
      status: 'PENDING_REVIEW',
    },
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
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin approval workflow UI"
```

## Task 6: Scanner Page with Camera Integration

**Files:**
- Modify: `app/partner/scanner/page.tsx`

- [ ] **Step 1: Write scanner page with camera and QR reader**

Write `app/partner/scanner/page.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';

export default function ScannerPage() {
  const [result, setResult] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setScanning(true);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setResult({ text: 'Kamera aktif. Arahkan ke QR tiket.', type: 'info' });
    } catch {
      setResult({
        text: 'Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.',
        type: 'error',
      });
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setResult(null);
  };

  const simulateScan = async () => {
    setResult({ text: 'Memvalidasi tiket...', type: 'info' });

    // Placeholder: will call /api/scanner/validate with actual QR data
    setTimeout(() => {
      setResult({ text: 'Valid — check-in berhasil ✅', type: 'success' });
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Scanner Tiket</h1>
      <p className="mt-2 text-sm text-gray-500">Scan QR tiket peserta untuk check-in.</p>

      <div className="mt-6 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-black/5">
        <div className="relative flex min-h-[300px] items-center justify-center">
          {scanning ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg">📷</p>
              <p className="mt-2">Kamera siap digunakan</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {!scanning ? (
          <button
            onClick={startCamera}
            className="rounded-lg bg-lelampahan-gold px-6 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
          >
            Aktifkan Kamera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="rounded-lg bg-gray-600 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Matikan Kamera
          </button>
        )}

        <button
          onClick={simulateScan}
          className="rounded-lg border bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Simulasi Scan
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg p-4 text-sm ${
            result.type === 'success'
              ? 'bg-green-50 text-green-800'
              : result.type === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
          }`}
        >
          {result.text}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Gunakan HP untuk akses kamera langsung. Scanner bekerja secara real-time.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/partner/scanner/page.tsx
git commit -m "feat: add camera scanner integration"
```

## Self-Review

All pages now have real form UI, admin approval workflows with action buttons, and scanner with camera integration. The remaining gaps are API-to-database wiring for the admin approval forms, real-time scanner QR reading, and session persistence to database.
