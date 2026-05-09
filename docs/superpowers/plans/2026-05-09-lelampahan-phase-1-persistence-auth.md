# Lelampahan Phase 1 — Database Persistence and Auth Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all in-memory placeholder API routes with real database queries through Prisma, add Supabase Auth integration for login/registration, and protect partner and admin routes with middleware.

**Architecture:** Create data-access layer modules under `src/data/` that wrap Prisma calls and expose typed repository functions. API routes call these functions instead of pure domain functions. Auth uses Supabase SSR (server-side rendering) client pattern for cookie-based sessions.

**Tech Stack:** Next.js Route Handlers, Supabase SSR (`@supabase/ssr`), Prisma Client, Zod.

---

## File Structure

New and modified files:

```text
src/
├── data/
│   ├── partner.ts        # Partner CRUD against Prisma
│   ├── listing.ts        # Listing CRUD against Prisma
│   ├── booking.ts        # Order/booking persistence
│   ├── payment.ts        # Payment record persistence
│   ├── ticket.ts         # Ticket persistence + check-in
│   └── session.ts        # Session/ticket type persistence
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Server-side Supabase client (service role)
│   │   └── middleware.ts  # Auth middleware for route protection
│   └── errors.ts         # API error handling helpers
app/
├── auth/
│   ├── login/
│   │   └── page.tsx       # Login page
│   ├── register/
│   │   └── page.tsx       # Register page
│   └── callback/
│       └── route.ts       # Supabase auth callback
└── middleware.ts           # Next.js middleware for route protection
```

## Prerequisites

Before starting, verify a running PostgreSQL database is accessible via the DATABASE_URL environment variable. Run the initial Prisma migration:

```bash
npx prisma migrate dev --name init
```

If no database is available, the plan should still work for API development — just skip the migration step and note it in the commit.

## Task 1: API Error Helpers and Prisma Migration

**Files:**
- Create: `src/lib/errors.ts`
- Run Prisma initial migration

- [ ] **Step 1: Create API error helpers**

Write `src/lib/errors.ts`:

```ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError } from '@/domain/shared/errors';

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

export function parseBody(request: Request): Promise<unknown> {
  return request.json().catch(() => {
    throw new DomainError('INVALID_JSON', 'Invalid JSON body');
  });
}
```

- [ ] **Step 2: Run Prisma migration (if database available)**

Run:
```bash
npx prisma migrate dev --name init 2>&1
```

If the database is not available, skip this step and note it:
```bash
echo "SKIP: Database not available — run migration after connecting PostgreSQL"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/errors.ts
git commit -m "chore: add API error helpers"
```

## Task 2: Data-Access Layer — Partner

**Files:**
- Create: `src/data/partner.ts`
- Modify: `app/api/partner/register/route.ts`
- Modify: `app/api/partner/[id]/route.ts`

- [ ] **Step 1: Create partner data-access module**

Write `src/data/partner.ts`:

```ts
import { prisma } from '@/db/prisma';
import { PartnerRegistrationInput } from '@/domain/partner/validation';
import { createPartner } from '@/domain/partner/service';

export async function createPartnerInDb(input: PartnerRegistrationInput) {
  const partnerData = createPartner({ input });

  const partner = await prisma.partner.create({
    data: {
      name: partnerData.name,
      slug: partnerData.slug,
      description: partnerData.description,
      capabilities: {
        create: partnerData.capabilities.map((cap) => ({
          type: cap.type,
          status: cap.status,
        })),
      },
      bankAccounts: {
        create: {
          bankName: partnerData.bankAccount.bankName,
          accountNumber: partnerData.bankAccount.accountNumber,
          accountHolder: partnerData.bankAccount.accountHolder,
          activeForPayout: true,
        },
      },
    },
    include: {
      capabilities: true,
      bankAccounts: true,
    },
  });

  return partner;
}

export async function findPartnerById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: { capabilities: true, bankAccounts: true, memberships: true },
  });
}

export async function listPartners(status?: string) {
  return prisma.partner.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Step 2: Update partner register route**

Modify `app/api/partner/register/route.ts` to use `createPartnerInDb` and `handleApiError`:

```ts
import { NextResponse } from 'next/server';
import { partnerRegistrationSchema } from '@/domain/partner/validation';
import { createPartnerInDb } from '@/data/partner';
import { handleApiError, parseBody } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = partnerRegistrationSchema.parse(body);
    const partner = await createPartnerInDb(input);
    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Update partner detail route**

Modify `app/api/partner/[id]/route.ts` to use `findPartnerById`:

```ts
import { NextResponse } from 'next/server';
import { findPartnerById } from '@/data/partner';
import { handleApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const partner = await findPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    return NextResponse.json(partner);
  } catch (error) {
    return handleApiError(error);
  }
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
git add src/data/partner.ts app/api/partner/
git commit -m "feat: add partner data persistence layer"
```

## Task 3: Data-Access Layer — Listing

**Files:**
- Create: `src/data/listing.ts`
- Create: `src/data/session.ts`
- Modify: `app/api/listing/route.ts`
- Modify: `app/api/listing/[id]/route.ts`
- Modify: `app/api/listing/[id]/submit/route.ts`
- Modify: `app/api/listing/[id]/approve/route.ts`
- Modify: `app/api/listing/search/route.ts`

- [ ] **Step 1: Create listing data-access module**

Write `src/data/listing.ts`:

```ts
import { prisma } from '@/db/prisma';
import { TourListingInput } from '@/domain/listing/validation';
import { createListingDraft } from '@/domain/listing/service';

export async function createListingInDb(input: TourListingInput) {
  const existingSlugs = (await prisma.listing.findMany({ select: { slug: true } })).map(
    (l) => l.slug,
  );
  const listingData = createListingDraft({ input, existingSlugs });

  const listing = await prisma.listing.create({
    data: {
      title: listingData.title,
      slug: listingData.slug,
      type: listingData.type,
      description: listingData.description,
      bookingMode: listingData.bookingMode,
      partnerId: listingData.partnerId,
      timezone: listingData.timezone,
      status: listingData.status,
      tourDetail: input.tourDetails
        ? {
            create: {
              duration: input.tourDetails.duration,
              itinerary: input.tourDetails.itinerary ?? undefined,
              included: input.tourDetails.included ?? undefined,
              excluded: input.tourDetails.excluded ?? undefined,
              meetingPoint: input.tourDetails.meetingPoint,
            },
          }
        : undefined,
      eventDetail: input.eventDetails
        ? {
            create: {
              venue: input.eventDetails.venue,
              gateNotes: input.eventDetails.gateNotes,
            },
          }
        : undefined,
    },
    include: { tourDetail: true, eventDetail: true },
  });

  return listing;
}

export async function findListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { tourDetail: true, eventDetail: true, sessions: true },
  });
}

export async function findListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      tourDetail: true,
      eventDetail: true,
      sessions: { where: { status: 'PUBLISHED' } },
    },
  });
}

export async function listPublishedListings() {
  return prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateListingStatus(id: string, status: string) {
  return prisma.listing.update({
    where: { id },
    data: { status: status as any },
  });
}
```

- [ ] **Step 2: Create session/ticket-type data module**

Write `src/data/session.ts`:

```ts
import { prisma } from '@/db/prisma';

export async function createSession(data: {
  listingId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  bookingCutoff: Date;
}) {
  return prisma.session.create({
    data,
  });
}

export async function createTicketType(data: {
  sessionId: string;
  name: string;
  price: number;
  quota?: number;
}) {
  return prisma.ticketType.create({
    data,
  });
}

export async function findSessionsByListing(listingId: string) {
  return prisma.session.findMany({
    where: { listingId },
    include: { ticketTypes: true },
    orderBy: { startsAt: 'asc' },
  });
}
```

- [ ] **Step 3: Update listing API routes to use data layer**

Modify `app/api/listing/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { listingSchema } from '@/domain/listing/validation';
import { createListingInDb, listPublishedListings } from '@/data/listing';
import { handleApiError, parseBody } from '@/lib/errors';

export async function GET() {
  try {
    const listings = await listPublishedListings();
    return NextResponse.json({ listings, total: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = listingSchema.parse(body);
    const listing = await createListingInDb(input);
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

Modify `app/api/listing/[id]/route.ts` — replace the GET handler body:

```ts
export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const listing = await findListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
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
git add src/data/listing.ts src/data/session.ts app/api/listing/
git commit -m "feat: add listing data persistence layer"
```

## Task 4: Data-Access Layer — Booking, Payment, Ticket

**Files:**
- Create: `src/data/booking.ts`
- Create: `src/data/payment.ts`
- Create: `src/data/ticket.ts`

- [ ] **Step 1: Create booking data module**

Write `src/data/booking.ts`:

```ts
import { prisma } from '@/db/prisma';

export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  sessionId: string;
  totalAmount: number;
  status?: string;
  items: Array<{ ticketTypeId: string; quantity: number; unitPrice: number; subtotal: number }>;
}) {
  return prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      userId: data.userId,
      sessionId: data.sessionId,
      totalAmount: data.totalAmount,
      status: (data.status || 'DRAFT') as any,
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  });
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, tickets: true },
  });
}

export async function findOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, payment: true, tickets: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({
    where: { id },
    data: { status: status as any },
  });
}
```

- [ ] **Step 2: Create payment data module**

Write `src/data/payment.ts`:

```ts
import { prisma } from '@/db/prisma';

export async function createPaymentRecord(data: {
  orderId: string;
  provider: string;
  method: string;
  amount: number;
  idempotencyKey: string;
  expiresAt: Date;
}) {
  return prisma.payment.create({
    data,
  });
}

export async function findPaymentByOrder(orderId: string) {
  return prisma.payment.findUnique({
    where: { orderId },
  });
}

export async function updatePaymentStatus(
  orderId: string,
  status: string,
  providerRef?: string,
  providerEventId?: string,
) {
  return prisma.payment.update({
    where: { orderId },
    data: {
      status: status as any,
      ...(providerRef ? { providerRef } : {}),
      ...(providerEventId ? { providerEventId } : {}),
    },
  });
}
```

- [ ] **Step 3: Create ticket data module**

Write `src/data/ticket.ts`:

```ts
import { prisma } from '@/db/prisma';

export async function createTicket(data: {
  orderId: string;
  code: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
}) {
  return prisma.ticket.create({
    data,
  });
}

export async function findTicketByCode(code: string) {
  return prisma.ticket.findUnique({
    where: { code },
    include: { checkIns: true },
  });
}

export async function findTicketsByOrder(orderId: string) {
  return prisma.ticket.findMany({
    where: { orderId },
  });
}

export async function recordCheckIn(data: {
  ticketId: string;
  staffId: string;
  result: string;
}) {
  return prisma.checkIn.create({
    data: {
      ticketId: data.ticketId,
      staffId: data.staffId,
      result: data.result as any,
    },
  });
}

export async function markTicketCheckedInDb(ticketId: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CHECKED_IN', checkedInAt: new Date() },
  });
}
```

- [ ] **Step 4: Run typecheck**

Run:
```bash
npm run typecheck
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add booking, payment, and ticket data persistence"
```

## Task 5: Update Booking, Payment, Scanner API Routes with Persistence

**Files:**
- Modify: `app/api/booking/instant/route.ts`
- Modify: `app/api/payment/create/route.ts`
- Modify: `app/api/payment/webhook/route.ts`
- Modify: `app/api/scanner/validate/route.ts`

- [ ] **Step 1: Update instant checkout route**

Modify `app/api/booking/instant/route.ts` to persist order and integrate reservation:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createInstantCheckout } from '@/domain/booking/checkout';
import { generateOrderNumber } from '@/lib/order-number';
import { createOrder } from '@/data/booking';
import { handleApiError, parseBody } from '@/lib/errors';

const checkoutSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = checkoutSchema.parse(body);
    const orderNumber = generateOrderNumber();

    const checkoutOrder = createInstantCheckout({ ...input, orderNumber });

    const persisted = await createOrder({
      orderNumber,
      userId: input.userId,
      sessionId: input.sessionId,
      totalAmount: input.totalAmount,
      status: checkoutOrder.status,
      items: checkoutOrder.items.map((item) => ({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    });

    return NextResponse.json(persisted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Update payment create route**

Modify `app/api/payment/create/route.ts` to persist payment record:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQrisPayment } from '@/domain/payment/qris-mock';
import { createPaymentRecord } from '@/data/payment';
import { handleApiError, parseBody } from '@/lib/errors';

const paymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().min(0),
  idempotencyKey: z.string().min(1),
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = paymentSchema.parse(body);

    const paymentResult = createQrisPayment(input);

    const persisted = await createPaymentRecord({
      orderId: input.orderId,
      provider: paymentResult.provider,
      method: paymentResult.method,
      amount: paymentResult.amount,
      idempotencyKey: input.idempotencyKey,
      expiresAt: paymentResult.expiresAt,
    });

    return NextResponse.json(persisted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Update webhook route to update payment and order**

Modify `app/api/payment/webhook/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePaymentStatus } from '@/data/payment';
import { updateOrderStatus } from '@/data/booking';
import { handleApiError, parseBody } from '@/lib/errors';

const webhookSchema = z.object({
  provider: z.string(),
  eventId: z.string(),
  providerRef: z.string(),
  orderId: z.string(),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED']),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const event = webhookSchema.parse(body);

    await updatePaymentStatus(
      event.orderId,
      event.status,
      event.providerRef,
      event.eventId,
    );

    if (event.status === 'PAID') {
      await updateOrderStatus(event.orderId, 'PAID');
    } else if (event.status === 'EXPIRED') {
      await updateOrderStatus(event.orderId, 'EXPIRED');
    }

    return NextResponse.json({
      received: true,
      orderId: event.orderId,
      status: event.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 4: Update scanner validate route to persist check-in**

Modify `app/api/scanner/validate/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTicketToken } from '@/domain/ticket/token';
import { env } from '@/config/env';
import { findTicketByCode, recordCheckIn, markTicketCheckedInDb } from '@/data/ticket';
import { handleApiError, parseBody } from '@/lib/errors';

const scanSchema = z.object({
  token: z.string().min(1),
  staffId: z.string().min(1),
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = scanSchema.parse(body);

    const decoded = verifyTicketToken(input.token, env.TICKET_TOKEN_SECRET);
    const ticket = await findTicketByCode(decoded.ticketCode);

    if (!ticket) {
      return NextResponse.json({ valid: false, result: 'INVALID_TICKET' });
    }

    if (ticket.status === 'CHECKED_IN') {
      return NextResponse.json({ valid: false, result: 'ALREADY_CHECKED_IN' });
    }

    await recordCheckIn({
      ticketId: ticket.id,
      staffId: input.staffId,
      result: 'VALID',
    });

    await markTicketCheckedInDb(ticket.id);

    return NextResponse.json({
      valid: true,
      result: 'VALID',
      ticketCode: decoded.ticketCode,
      ticketId: ticket.id,
      sessionId: input.sessionId,
      checkedInAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 5: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/booking/ app/api/payment/ app/api/scanner/
git commit -m "feat: update API routes with database persistence"
```

## Task 6: Supabase Auth Integration

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `app/middleware.ts`
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/register/page.tsx`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create Supabase server client**

Write `src/lib/supabase/client.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
```

- [ ] **Step 2: Create auth middleware utilities**

Write `src/lib/supabase/middleware.ts`:

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

- [ ] **Step 3: Create Next.js middleware for route protection**

Write `app/middleware.ts`:

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const partnerRoutes = ['/partner'];
const adminRoutes = ['/admin'];
const authRoutes = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect partner routes
  if (partnerRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protect admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 4: Create login page**

Write `app/auth/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Masuk</h1>
      <p className="mt-2 text-sm text-gray-500">Login ke akun Lelampahan Anda.</p>

      <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-lelampahan-gold px-6 py-2 font-medium text-white hover:bg-lelampahan-brick"
        >
          Masuk
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Create register page**

Write `app/auth/register/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="text-3xl font-bold text-lelampahan-earth">Cek Email</h1>
        <p className="mt-4 text-gray-600">
          Kami sudah mengirim email konfirmasi ke <strong>{email}</strong>.
          Klik link di email untuk mengaktifkan akun Anda.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Daftar</h1>
      <p className="mt-2 text-sm text-gray-500">Buat akun Lelampahan baru.</p>

      <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-lelampahan-gold px-6 py-2 font-medium text-white hover:bg-lelampahan-brick"
        >
          Daftar
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Create auth callback route**

Write `app/auth/callback/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
```

- [ ] **Step 7: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase/ app/middleware.ts app/auth/
git commit -m "feat: add supabase auth with route protection"
```

## Self-Review Checklist

**Spec coverage:**
- Database persistence for partner, listing, session, booking, payment, ticket: Tasks 1-4.
- API routes updated to use database instead of placeholders: Tasks 2-5.
- Auth integration with Supabase login/register pages: Task 6.
- Auth middleware protecting partner and admin routes: Task 6.
- Error handling helpers: Task 1.

**Gaps deferred to later plans:**
- Email notifications (Resend).
- Real QRIS provider integration (Midtrans/Xendit).
- Listing form UI with all fields.
- Settlement, ledger, refund endpoints.
- Production deployment config.
