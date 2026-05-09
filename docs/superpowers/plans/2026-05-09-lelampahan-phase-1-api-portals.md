# Lelampahan Phase 1 — API Routes, Partner Portal, and Admin Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the API route handlers for partner, listing, booking, payment, and scanner operations, plus the partner portal pages (dashboard, listings management, scanner) and admin portal pages (approval queues for partners and listings).

**Architecture:** API routes live under `app/api/` using Next.js Route Handlers. Each route handler calls domain service functions and returns JSON. Partner and admin portals use route groups under `app/partner/` and `app/admin/` with their own layouts and page components.

**Tech Stack:** Next.js Route Handlers, TypeScript, domain services from previous plans, Zod for input validation.

---

## File Structure

New files:

```text
app/
├── partner/
│   ├── layout.tsx              # Partner portal layout + sidebar
│   ├── page.tsx                # Partner dashboard with metrics
│   ├── listings/
│   │   ├── page.tsx            # Listing management table
│   │   ├── new/page.tsx        # Create listing form
│   │   └── [id]/
│   │       ├── page.tsx        # Edit listing
│   │       └── sessions/page.tsx  # Manage sessions/ticket types
│   └── scanner/
│       └── page.tsx            # Scanner page with camera input
├── admin/
│   ├── layout.tsx              # Admin layout + sidebar
│   ├── page.tsx                # Admin dashboard
│   ├── partners/
│   │   └── page.tsx            # Partner approval queue
│   └── listings/
│       └── page.tsx            # Listing review queue
├── api/
│   ├── partner/
│   │   ├── register/route.ts   # POST create new partner
│   │   └── [id]/
│   │       ├── route.ts        # GET/PATCH partner
│   │       └── capabilities/route.ts  # POST approve/reject
│   ├── listing/
│   │   ├── route.ts            # GET list published / POST create draft
│   │   ├── [id]/
│   │   │   ├── route.ts        # GET/PATCH listing
│   │   │   ├── submit/route.ts # POST submit for review
│   │   │   └── approve/route.ts # POST approve/reject
│   │   └── search/route.ts     # GET search/filter listings
│   ├── booking/
│   │   ├── instant/route.ts    # POST instant checkout
│   │   ├── request/route.ts    # POST create booking request
│   │   └── [id]/
│   │       ├── approve/route.ts  # POST partner approve request
│   │       └── reject/route.ts   # POST partner reject request
│   ├── payment/
│   │   ├── create/route.ts     # POST create QRIS payment
│   │   └── webhook/route.ts    # POST provider webhook (mock)
│   └── scanner/
│       └── validate/route.ts   # POST validate and check-in ticket
└── account/
    ├── orders/page.tsx         # Order history page
    └── tickets/page.tsx        # Ticket wallet (already exists)
```

## Task 1: Partner API Routes

**Files:**
- Create: `app/api/partner/register/route.ts`
- Create: `app/api/partner/[id]/route.ts`
- Create: `app/api/partner/[id]/capabilities/route.ts`

- [ ] **Step 1: Create partner register route**

Write `app/api/partner/register/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { partnerRegistrationSchema, PartnerRegistrationInput } from '@/domain/partner/validation';
import { createPartner } from '@/domain/partner/service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = partnerRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
      { status: 422 },
    );
  }

  const input = parsed.data as PartnerRegistrationInput;
  const partner = createPartner({ input });

  return NextResponse.json(partner, { status: 201 });
}
```

- [ ] **Step 2: Create partner detail route**

Write `app/api/partner/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;

  // Placeholder: will fetch from database in a later task
  return NextResponse.json({ id, name: 'Partner placeholder', status: 'PENDING_REVIEW' });
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Placeholder: will update database in a later task
  return NextResponse.json({ id, ...(body as object) });
}
```

- [ ] **Step 3: Create partner capabilities route**

Write `app/api/partner/[id]/capabilities/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const actionSchema = z.object({
  type: z.enum(['TOURS', 'EVENTS']),
  action: z.enum(['approve', 'reject']),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 422 });
  }

  return NextResponse.json({
    partnerId: id,
    type: parsed.data.type,
    status: parsed.data.action === 'approve' ? 'APPROVED' : 'REJECTED',
  });
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/partner/
git commit -m "feat: add partner API routes"
```

## Task 2: Listing API Routes

**Files:**
- Create: `app/api/listing/route.ts`
- Create: `app/api/listing/[id]/route.ts`
- Create: `app/api/listing/[id]/submit/route.ts`
- Create: `app/api/listing/[id]/approve/route.ts`
- Create: `app/api/listing/search/route.ts`

- [ ] **Step 1: Create listing list and create routes**

Write `app/api/listing/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { listingSchema, TourListingInput } from '@/domain/listing/validation';
import { createListingDraft } from '@/domain/listing/service';

export async function GET() {
  // Placeholder: will return published listings from database
  return NextResponse.json({ listings: [], total: 0 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
      { status: 422 },
    );
  }

  const input = parsed.data as TourListingInput;
  const listing = createListingDraft({ input, existingSlugs: [] });

  return NextResponse.json(listing, { status: 201 });
}
```

- [ ] **Step 2: Create listing detail route**

Write `app/api/listing/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  // Placeholder: will fetch from database
  return NextResponse.json({ id, title: 'Listing placeholder' });
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  return NextResponse.json({ id, ...(body as object) });
}
```

- [ ] **Step 3: Create listing submit and approve routes**

Write `app/api/listing/[id]/submit/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { submitListingForReview } from '@/domain/listing/service';
import { ListingData } from '@/domain/listing/service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;

  // Placeholder: fetch listing from database, then call domain service
  const draftListing: ListingData = {
    title: 'Sample',
    slug: 'sample',
    type: 'TOUR',
    description: 'A sample listing.',
    bookingMode: 'INSTANT_CONFIRMATION',
    partnerId: 'p1',
    timezone: 'Asia/Jakarta',
    status: 'DRAFT',
  };

  try {
    const submitted = submitListingForReview(draftListing);
    return NextResponse.json(submitted);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

Write `app/api/listing/[id]/approve/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { approveListing, rejectListing } from '@/domain/listing/service';
import { ListingData } from '@/domain/listing/service';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 422 });
  }

  // Placeholder: fetch listing from database
  const pendingListing: ListingData = {
    title: 'Sample',
    slug: 'sample',
    type: 'TOUR',
    description: 'A sample listing.',
    bookingMode: 'INSTANT_CONFIRMATION',
    partnerId: 'p1',
    timezone: 'Asia/Jakarta',
    status: 'PENDING_REVIEW',
  };

  try {
    const result = parsed.data.action === 'approve'
      ? approveListing(pendingListing)
      : rejectListing(pendingListing);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 4: Create listing search route**

Write `app/api/listing/search/route.ts`:

```ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const q = searchParams.get('q');

  // Placeholder: will query database with filters
  return NextResponse.json({
    query: q,
    filter: { type },
    listings: [],
    total: 0,
  });
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/listing/
git commit -m "feat: add listing API routes"
```

## Task 3: Booking API Routes

**Files:**
- Create: `app/api/booking/instant/route.ts`
- Create: `app/api/booking/request/route.ts`
- Create: `app/api/booking/[id]/approve/route.ts`
- Create: `app/api/booking/[id]/reject/route.ts`

- [ ] **Step 1: Create instant checkout route**

Write `app/api/booking/instant/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createInstantCheckout } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';

const checkoutSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    }, { status: 422 });
  }

  try {
    const order = createInstantCheckout({
      ...parsed.data,
      orderNumber: generateOrderNumber(),
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 2: Create booking request route**

Write `app/api/booking/request/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingRequest } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';

const requestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
  message: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    }, { status: 422 });
  }

  try {
    const booking = createBookingRequest({
      ...parsed.data,
      orderNumber: generateOrderNumber(),
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Create booking approve/reject routes**

Write `app/api/booking/[id]/approve/route.ts`:

```ts
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  // Placeholder: fetch booking, call approveBookingRequest from domain service
  return NextResponse.json({ id, status: 'PARTNER_APPROVED' });
}
```

Write `app/api/booking/[id]/reject/route.ts`:

```ts
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  // Placeholder: fetch booking, call rejectBookingRequest from domain service
  return NextResponse.json({ id, status: 'PARTNER_REJECTED' });
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/booking/
git commit -m "feat: add booking API routes"
```

## Task 4: Payment and Scanner API Routes

**Files:**
- Create: `app/api/payment/create/route.ts`
- Create: `app/api/payment/webhook/route.ts`
- Create: `app/api/scanner/validate/route.ts`

- [ ] **Step 1: Create payment create route**

Write `app/api/payment/create/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQrisPayment } from '@/domain/payment/qris-mock';

const paymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().min(0),
  idempotencyKey: z.string().min(1),
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    }, { status: 422 });
  }

  const payment = createQrisPayment(parsed.data);
  return NextResponse.json(payment, { status: 201 });
}
```

- [ ] **Step 2: Create payment webhook route (mock)**

Write `app/api/payment/webhook/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const webhookSchema = z.object({
  provider: z.string(),
  eventId: z.string(),
  providerRef: z.string(),
  orderId: z.string(),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED']),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 422 });
  }

  // Placeholder: normalize event and update order status
  const { orderId, status } = parsed.data;

  return NextResponse.json({
    received: true,
    orderId,
    status,
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 3: Create scanner validate route**

Write `app/api/scanner/validate/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTicketToken } from '@/domain/ticket/token';
import { env } from '@/config/env';

const scanSchema = z.object({
  token: z.string().min(1),
  staffId: z.string().min(1),
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 422 });
  }

  try {
    const decoded = verifyTicketToken(parsed.data.token, env.TICKET_TOKEN_SECRET);
    // Placeholder: validate ticket against database
    // Placeholder: check sessionId matches, ticket not already checked in
    return NextResponse.json({
      valid: true,
      result: 'VALID',
      ticketCode: decoded.ticketCode,
      ticketId: 'ticket-placeholder',
      sessionId: parsed.data.sessionId,
      checkedInAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ valid: false, result: 'INVALID_TICKET' }, { status: 200 });
  }
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/payment/ app/api/scanner/
git commit -m "feat: add payment and scanner API routes"
```

## Task 5: Partner Portal Pages

**Files:**
- Create: `app/partner/layout.tsx`
- Create: `app/partner/page.tsx`
- Create: `app/partner/listings/page.tsx`
- Create: `app/partner/listings/new/page.tsx`
- Create: `app/partner/listings/[id]/page.tsx`
- Create: `app/partner/listings/[id]/sessions/page.tsx`
- Create: `app/partner/scanner/page.tsx`

- [ ] **Step 1: Create partner portal layout with sidebar**

Write `app/partner/layout.tsx`:

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/partner" className="text-lg font-bold text-lelampahan-earth">
            Partner • Lelampahan
          </Link>
          <Link href="/" className="text-sm font-medium text-lelampahan-brick">
            Ke Marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-2">
            <Link href="/partner" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Dashboard
            </Link>
            <Link href="/partner/listings" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Listings
            </Link>
            <Link href="/partner/scanner" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Scanner
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create partner dashboard page**

Write `app/partner/page.tsx`:

```tsx
export default function PartnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings Aktif</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pesanan Baru</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pendapatan (Estimasi)</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp0</p>
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Dashboard akan terhubung ke database pada implementasi berikutnya.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create listing management pages**

Write `app/partner/listings/page.tsx`:

```tsx
import Link from 'next/link';

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
      <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
        <p>Belum ada listing. Buat listing pertama Anda.</p>
      </div>
    </div>
  );
}
```

Write `app/partner/listings/new/page.tsx`:

```tsx
export default function NewListingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Buat Listing Baru</h1>
      <p className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        Form pembuatan listing akan diimplementasikan setelah database terhubung.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create listing edit and sessions pages**

Write `app/partner/listings/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Edit Listing</h1>
      <p className="mt-4 text-gray-500">Form edit untuk listing {id} akan aktif setelah database terhubung.</p>
    </div>
  );
}
```

Write `app/partner/listings/[id]/sessions/page.tsx`:

```tsx
interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Sesi & Tiket</h1>
      <p className="mt-4 text-gray-500">Kelola sesi dan tipe tiket untuk listing {id}.</p>
    </div>
  );
}
```

- [ ] **Step 5: Create scanner page**

Write `app/partner/scanner/page.tsx`:

```tsx
'use client';

import { useState } from 'react';

export default function ScannerPage() {
  const [result, setResult] = useState<string | null>(null);

  const handleSimulateScan = async () => {
    setResult('Scanning...');
    // Placeholder: will call camera API and /api/scanner/validate in a later task
    setTimeout(() => {
      setResult('Tiket valid — check-in berhasil ✅');
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Scanner Tiket</h1>
      <p className="mt-2 text-sm text-gray-500">Scan QR tiket peserta untuk check-in.</p>

      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-400">Kamera scanner akan aktif di sini.</p>
        <p className="mt-2 text-xs text-gray-400">(Gunakan HP untuk scan langsung)</p>

        <button
          onClick={handleSimulateScan}
          className="mt-6 rounded-lg bg-lelampahan-gold px-6 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
        >
          Simulasi Scan
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          {result}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/partner/
git commit -m "feat: add partner portal pages"
```

## Task 6: Admin Portal Pages

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/partners/page.tsx`
- Create: `app/admin/listings/page.tsx`

- [ ] **Step 1: Create admin layout**

Write `app/admin/layout.tsx`:

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-lelampahan-earth">
            Admin • Lelampahan
          </Link>
          <Link href="/" className="text-sm font-medium text-lelampahan-brick">
            Ke Marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Dashboard
            </Link>
            <Link href="/admin/partners" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Partners
            </Link>
            <Link href="/admin/listings" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream">
              Listings
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create admin dashboard page**

Write `app/admin/page.tsx`:

```tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Partner</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp0</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create partner approval queue page**

Write `app/admin/partners/page.tsx`:

```tsx
export default function AdminPartnerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Partner Approval</h1>
      <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
        <p>Belum ada partner yang perlu di-approve.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create listing review queue page**

Write `app/admin/listings/page.tsx`:

```tsx
export default function AdminListingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Listing Review</h1>
      <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
        <p>Belum ada listing yang perlu di-review.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin portal pages"
```

## Task 7: Account Order History Page

**Files:**
- Create: `app/account/orders/page.tsx`

- [ ] **Step 1: Create order history page**

Write `app/account/orders/page.tsx`:

```tsx
export default function OrderHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Riwayat Pesanan</h1>
      <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
        <p>Belum ada pesanan.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/account/orders/
git commit -m "feat: add order history page"
```

## Self-Review Checklist

**Spec coverage:**
- Partner onboarding and capability approval API: Task 1.
- Listing creation, submit, review, approve/reject API: Task 2.
- Instant confirmation checkout API: Task 3.
- Request-to-book API with partner approve/reject: Task 3.
- Scanner validation API with signed token verification: Task 4.
- Payment creation (mock QRIS) and webhook API: Task 4.
- Partner portal layout, dashboard, listing management, scanner page: Task 5.
- Admin portal layout, dashboard, partner approval queue, listing review queue: Task 6.
- Account order history page: Task 7.

**Gaps deferred to later plans:**
- Database persistence layer for all API routes (currently all placeholder/in-memory).
- Actual camera integration on scanner page.
- QRIS provider integration (Midtrans/Xendit).
- Email notifications (Resend).
- Auth middleware protecting partner/admin routes.
- Settlement, ledger, refund endpoints.
- Form UI for listing creation with all fields.
