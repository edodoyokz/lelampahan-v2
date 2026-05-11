# Dashboard Priority Security & Summary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix priority dashboard security/correctness issues and replace customer, partner, and admin placeholder dashboard stats with real scoped summary data.

**Architecture:** Add reusable API authorization guards for partner ownership, listing ownership, and super admin access, then use them in sensitive API routes. Add small data helpers and role-specific summary endpoints/pages so dashboard UI reads real counts instead of hardcoded placeholders.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, Supabase SSR auth, Vitest, ESLint.

---

## Task 1: Add Partner/Auth Guard Tests

**Files:**
- Modify: `src/lib/auth/api.ts`
- Test: `tests/auth/api-guards.test.ts`

**Step 1: Write failing tests**

Create `tests/auth/api-guards.test.ts` if it does not exist. Mock Supabase API user lookup and Prisma/data helpers as needed. Test these behaviors:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: vi.fn(),
}));

vi.mock('@/data/listing', () => ({
  findListingById: vi.fn(),
}));

vi.mock('@/lib/auth/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/api')>();
  return {
    ...actual,
    getApiUser: vi.fn(),
  };
});

describe('API auth guards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects partner ownership when authenticated user belongs to another partner', async () => {
    const api = await import('@/lib/auth/api');
    const partner = await import('@/data/partner');
    vi.mocked(api.getApiUser).mockResolvedValue({ id: 'auth-1', email: 'p@test.dev' } as any);
    vi.mocked(partner.findPartnerContextByAuthUserId).mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'A', status: 'APPROVED' },
    } as any);

    const result = await api.requirePartnerOwnership(new Request('http://test.local'), 'partner-b');

    expect(result.context).toBeNull();
    expect(result.response?.status).toBe(403);
  });

  it('allows partner ownership when partner ids match', async () => {
    const api = await import('@/lib/auth/api');
    const partner = await import('@/data/partner');
    vi.mocked(api.getApiUser).mockResolvedValue({ id: 'auth-1', email: 'p@test.dev' } as any);
    vi.mocked(partner.findPartnerContextByAuthUserId).mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'A', status: 'APPROVED' },
    } as any);

    const result = await api.requirePartnerOwnership(new Request('http://test.local'), 'partner-a');

    expect(result.response).toBeNull();
    expect(result.context?.partner.id).toBe('partner-a');
  });

  it('rejects listing ownership when listing belongs to another partner', async () => {
    const api = await import('@/lib/auth/api');
    const partner = await import('@/data/partner');
    const listing = await import('@/data/listing');
    vi.mocked(api.getApiUser).mockResolvedValue({ id: 'auth-1', email: 'p@test.dev' } as any);
    vi.mocked(partner.findPartnerContextByAuthUserId).mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'A', status: 'APPROVED' },
    } as any);
    vi.mocked(listing.findListingById).mockResolvedValue({ id: 'listing-1', partnerId: 'partner-b' } as any);

    const result = await api.requireListingOwnership(new Request('http://test.local'), 'listing-1');

    expect(result.response?.status).toBe(403);
    expect(result.context).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/auth/api-guards.test.ts
```

Expected: FAIL because `requirePartnerOwnership` and `requireListingOwnership` do not exist.

**Step 3: Implement auth guards**

Modify `src/lib/auth/api.ts`.

Add imports:

```ts
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { findListingById } from '@/data/listing';
```

Add helpers:

```ts
export async function requireApiSuperAdmin(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (getUserRole(user) !== 'SUPER_ADMIN') {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, response: null };
}

export async function requireApiPartnerContext(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.response) return { user: null, context: null, response: auth.response };

  const context = await findPartnerContextByAuthUserId(auth.user.id);
  if (!context) {
    return {
      user: auth.user,
      context: null,
      response: NextResponse.json({ error: 'Partner membership not found' }, { status: 404 }),
    };
  }

  return { user: auth.user, context, response: null };
}

export async function requirePartnerOwnership(request: Request, partnerId: string) {
  const auth = await requireApiPartnerContext(request);
  if (auth.response) return auth;

  if (auth.context.partner.id !== partnerId) {
    return {
      user: auth.user,
      context: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireListingOwnership(request: Request, listingId: string) {
  const auth = await requireApiPartnerContext(request);
  if (auth.response) return { ...auth, listing: null };

  const listing = await findListingById(listingId);
  if (!listing) {
    return {
      user: auth.user,
      context: auth.context,
      listing: null,
      response: NextResponse.json({ error: 'Listing not found' }, { status: 404 }),
    };
  }

  if (listing.partnerId !== auth.context.partner.id) {
    return {
      user: auth.user,
      context: null,
      listing: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ...auth, listing };
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/auth/api-guards.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/auth/api.ts tests/auth/api-guards.test.ts
git commit -m "feat: add reusable dashboard API auth guards"
```

---

## Task 2: Apply Partner Ownership Guards to Listing APIs

**Files:**
- Modify: `app/api/partner/[id]/listings/route.ts`
- Modify: `app/api/listing/route.ts`
- Modify: `app/api/listing/[id]/submit/route.ts`
- Modify: `app/api/listing/[id]/sessions/route.ts`
- Test: `tests/api/partner-listing-authorization.test.ts`

**Step 1: Write failing tests**

Add tests that call route handlers with mocked guards/data helpers. Cover:

1. `GET /api/partner/[id]/listings` returns 403 if `requirePartnerOwnership` returns response.
2. `POST /api/listing` creates listing using authenticated partner context, not arbitrary client `partnerId`.
3. `POST /api/listing/[id]/submit` returns 403 when `requireListingOwnership` fails.
4. `PUT /api/listing/[id]/sessions` returns 403 when `requireListingOwnership` fails.
5. `GET /api/listing/[id]/sessions` is protected by listing ownership.

Use Vitest mocks for `@/lib/auth/api`, `@/data/listing`, and `@/data/session`.

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/api/partner-listing-authorization.test.ts
```

Expected: FAIL because routes still use `requireApiUser` or no ownership guard.

**Step 3: Update partner listings route**

Modify `app/api/partner/[id]/listings/route.ts`:

```ts
import { requirePartnerOwnership } from '@/lib/auth/api';

// inside GET
const { id } = await params;
const auth = await requirePartnerOwnership(request, id);
if (auth.response) return auth.response;

const listings = await listListingsForPartner(id);
```

**Step 4: Update create listing route**

Modify `app/api/listing/route.ts` POST:

```ts
import { requireApiPartnerContext } from '@/lib/auth/api';

const auth = await requireApiPartnerContext(request);
if (auth.response) return auth.response;

const body = await parseBody(request);
const input = listingSchema.parse({
  ...body,
  partnerId: auth.context.partner.id,
});
const listing = await createListingInDb(input);
```

This prevents client-supplied `partnerId` from assigning listings to another partner.

**Step 5: Update submit listing route**

Modify `app/api/listing/[id]/submit/route.ts`:

```ts
import { requireListingOwnership } from '@/lib/auth/api';

const { id } = await params;
const auth = await requireListingOwnership(request, id);
if (auth.response) return auth.response;

const listing = await updateListingStatus(id, 'PENDING_REVIEW');

await recordAuditLog({
  actorUserId: auth.user.id,
  action: 'listing.submitted',
  entityType: 'Listing',
  entityId: id,
  metadata: { status: 'PENDING_REVIEW' },
});
```

**Step 6: Update sessions route**

Modify `app/api/listing/[id]/sessions/route.ts`:

For GET:

```ts
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const auth = await requireListingOwnership(request, id);
    if (auth.response) return auth.response;

    const sessions = await findSessionsByListing(id);
    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    return handleApiError(error);
  }
}
```

For PUT, replace `requireApiUser` with `requireListingOwnership`.

**Step 7: Run tests**

Run:

```bash
npm test -- tests/api/partner-listing-authorization.test.ts
npm test -- tests/auth/api-guards.test.ts
```

Expected: PASS.

**Step 8: Commit**

```bash
git add app/api/partner/[id]/listings/route.ts app/api/listing/route.ts app/api/listing/[id]/submit/route.ts app/api/listing/[id]/sessions/route.ts tests/api/partner-listing-authorization.test.ts
git commit -m "fix: enforce partner listing ownership in APIs"
```

---

## Task 3: Fix Customer Ticket Wallet User Mapping

**Files:**
- Modify: `app/account/tickets/page.tsx`
- Test: `tests/account/ticket-wallet.test.tsx` or existing related test file

**Step 1: Write failing test**

Mock `getCurrentUser`, `ensureUserProfileForAuthUser`, and `findTicketsByUser`. Assert `findTicketsByUser` receives `profile.id`, not `authUser.id`.

Pseudo-test:

```ts
it('loads tickets by UserProfile id rather than Supabase auth user id', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'auth-user-1',
    email: 'customer@test.dev',
    user_metadata: { full_name: 'Customer' },
  } as any);
  vi.mocked(ensureUserProfileForAuthUser).mockResolvedValue({ id: 'profile-1' } as any);
  vi.mocked(findTicketsByUser).mockResolvedValue([] as any);

  await TicketWalletPage();

  expect(findTicketsByUser).toHaveBeenCalledWith('profile-1');
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/account/ticket-wallet.test.tsx
```

Expected: FAIL because current page passes auth user id.

**Step 3: Implement fix**

Modify `app/account/tickets/page.tsx`:

```ts
import { ensureUserProfileForAuthUser } from '@/data/user';
```

After auth check:

```ts
const profile = await ensureUserProfileForAuthUser({
  authUserId: user.id,
  email: user.email,
  name:
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null,
});

const tickets = await findTicketsByUser(profile.id);
```

**Step 4: Run test**

Run:

```bash
npm test -- tests/account/ticket-wallet.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/account/tickets/page.tsx tests/account/ticket-wallet.test.tsx
git commit -m "fix: load customer tickets through user profile"
```

---

## Task 4: Add Super Admin Route Guard

**Files:**
- Modify: `app/middleware.ts`
- Test: `tests/auth/middleware.test.ts` or existing middleware test

**Step 1: Write failing tests**

Test regular `ADMIN` cannot access:

- `/admin/users`
- `/admin/audit`
- `/admin/settings`

Test `SUPER_ADMIN` can access them.

If existing middleware tests mock Supabase user metadata, reuse that pattern.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/auth/middleware.test.ts
```

Expected: FAIL because admin currently can access all `/admin/*`.

**Step 3: Implement middleware guard**

Modify `app/middleware.ts`:

```ts
const superAdminRoutes = ['/admin/users', '/admin/audit', '/admin/settings'];
```

Inside admin route block after role is computed:

```ts
const role = getUserRole(user);

if (!canAccessAdminRoute(role)) {
  return NextResponse.redirect(new URL('/', request.url));
}

if (superAdminRoutes.some((route) => pathname.startsWith(route)) && role !== 'SUPER_ADMIN') {
  return NextResponse.redirect(new URL('/admin', request.url));
}
```

Avoid calling `getUserRole(user)` twice.

**Step 4: Run test**

Run:

```bash
npm test -- tests/auth/middleware.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/middleware.ts tests/auth/middleware.test.ts
git commit -m "fix: restrict super admin dashboard routes"
```

---

## Task 5: Secure Scanner Validation Endpoint

**Files:**
- Modify: `app/api/scanner/validate/route.ts`
- Modify: `src/data/ticket.ts`
- Test: `tests/api/scanner-authorization.test.ts`

**Step 1: Write failing tests**

Tests:

1. Anonymous request returns 401.
2. Partner user with no membership returns 404.
3. Ticket for another partner/listing/session returns invalid/wrong scope.
4. Valid scoped ticket records check-in.

Mock `requireApiPartnerContext`, `findTicketByCode`, `recordCheckIn`, and `markTicketCheckedInDb`.

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/api/scanner-authorization.test.ts
```

Expected: FAIL because scanner route has no auth/scope checks.

**Step 3: Expand ticket lookup include**

Modify `src/data/ticket.ts` `findTicketByCode` to include order/session/listing partner scope:

```ts
export async function findTicketByCode(code: string) {
  return prisma.ticket.findUnique({
    where: { code },
    include: {
      checkIns: true,
      order: {
        include: {
          session: {
            include: {
              listing: true,
            },
          },
        },
      },
    },
  });
}
```

**Step 4: Update scanner schema and auth**

Modify `app/api/scanner/validate/route.ts`:

- Import `requireApiPartnerContext`.
- Remove `staffId` from schema if possible.
- Keep `sessionId` and `token`.

```ts
const scanSchema = z.object({
  token: z.string().min(1),
  sessionId: z.string().min(1),
});
```

Inside POST:

```ts
const auth = await requireApiPartnerContext(request);
if (auth.response) return auth.response;

const body = await parseBody(request);
const input = scanSchema.parse(body);

const decoded = verifyTicketToken(input.token, env.TICKET_TOKEN_SECRET);
const ticket = await findTicketByCode(decoded.ticketCode);

if (!ticket) {
  return NextResponse.json({ valid: false, result: 'INVALID_TICKET' });
}

if (ticket.order.sessionId !== input.sessionId) {
  await recordCheckIn({
    ticketId: ticket.id,
    staffId: auth.context.userProfileId,
    result: 'WRONG_SCOPE',
  });
  return NextResponse.json({ valid: false, result: 'WRONG_SCOPE' });
}

if (ticket.order.session.listing.partnerId !== auth.context.partner.id) {
  await recordCheckIn({
    ticketId: ticket.id,
    staffId: auth.context.userProfileId,
    result: 'WRONG_SCOPE',
  });
  return NextResponse.json({ valid: false, result: 'WRONG_SCOPE' });
}

if (ticket.status === 'CHECKED_IN') {
  return NextResponse.json({ valid: false, result: 'ALREADY_CHECKED_IN' });
}

await recordCheckIn({
  ticketId: ticket.id,
  staffId: auth.context.userProfileId,
  result: 'VALID',
});
```

**Step 5: Run tests**

Run:

```bash
npm test -- tests/api/scanner-authorization.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add app/api/scanner/validate/route.ts src/data/ticket.ts tests/api/scanner-authorization.test.ts
git commit -m "fix: secure scanner validation scope"
```

---

## Task 6: Add Summary Data Helpers

**Files:**
- Create: `src/data/dashboard-summary.ts`
- Test: `tests/data/dashboard-summary.test.ts`

**Step 1: Write failing tests**

Test each helper with mocked Prisma:

- `getCustomerDashboardSummary(userProfileId)` returns total orders, issued tickets, pending payment orders.
- `getPartnerDashboardSummary(partnerId, now)` returns listing counts, order counts, monthly revenue.
- `getAdminDashboardSummary()` returns partner/listing counts and gross revenue.

Expected function signatures:

```ts
export async function getCustomerDashboardSummary(userProfileId: string): Promise<{
  totalOrders: number;
  activeTickets: number;
  pendingPaymentOrders: number;
}>;

export async function getPartnerDashboardSummary(partnerId: string, now?: Date): Promise<{
  activeListings: number;
  draftReviewListings: number;
  requestedBookings: number;
  pendingPaymentBookings: number;
  monthlyPaidOrders: number;
  estimatedMonthlyRevenue: number;
}>;

export async function getAdminDashboardSummary(): Promise<{
  totalPartners: number;
  totalListings: number;
  pendingPartnerReviews: number;
  pendingListingReviews: number;
  grossRevenue: number;
}>;
```

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/data/dashboard-summary.test.ts
```

Expected: FAIL because file/functions do not exist.

**Step 3: Implement data helper**

Create `src/data/dashboard-summary.ts`.

Use Prisma counts/aggregate:

```ts
import { OrderStatus, ReviewStatus, TicketStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getCustomerDashboardSummary(userProfileId: string) {
  const [totalOrders, activeTickets, pendingPaymentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: userProfileId } }),
    prisma.ticket.count({ where: { status: TicketStatus.ISSUED, order: { userId: userProfileId } } }),
    prisma.order.count({ where: { userId: userProfileId, status: OrderStatus.PENDING_PAYMENT } }),
  ]);

  return { totalOrders, activeTickets, pendingPaymentOrders };
}

function monthRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function getPartnerDashboardSummary(partnerId: string, now = new Date()) {
  const { start, end } = monthRange(now);

  const [
    activeListings,
    draftReviewListings,
    requestedBookings,
    pendingPaymentBookings,
    monthlyPaidOrders,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.listing.count({ where: { partnerId, status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({ where: { partnerId, status: { in: [ReviewStatus.DRAFT, ReviewStatus.PENDING_REVIEW] } } }),
    prisma.order.count({ where: { session: { listing: { partnerId } }, status: 'REQUESTED' as any } }),
    prisma.order.count({ where: { session: { listing: { partnerId } }, status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({
      where: {
        session: { listing: { partnerId } },
        status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
        createdAt: { gte: start, lt: end },
      },
    }),
    prisma.order.aggregate({
      where: {
        session: { listing: { partnerId } },
        status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
        createdAt: { gte: start, lt: end },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    activeListings,
    draftReviewListings,
    requestedBookings,
    pendingPaymentBookings,
    monthlyPaidOrders,
    estimatedMonthlyRevenue: monthlyRevenue._sum.totalAmount ?? 0,
  };
}

export async function getAdminDashboardSummary() {
  const [
    totalPartners,
    totalListings,
    pendingPartnerReviews,
    pendingListingReviews,
    revenue,
  ] = await Promise.all([
    prisma.partner.count({ where: { archivedAt: null } }),
    prisma.listing.count({ where: { archivedAt: null } }),
    prisma.partner.count({ where: { status: ReviewStatus.PENDING_REVIEW, archivedAt: null } }),
    prisma.listing.count({ where: { status: ReviewStatus.PENDING_REVIEW, archivedAt: null } }),
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalPartners,
    totalListings,
    pendingPartnerReviews,
    pendingListingReviews,
    grossRevenue: revenue._sum.totalAmount ?? 0,
  };
}
```

Note: if TypeScript rejects `'REQUESTED' as any` because `OrderStatus` does not include it, decide during implementation whether to remove requested count or map it to an actual existing persisted status. Prefer test-driven confirmation from current schema/data.

**Step 4: Run tests**

Run:

```bash
npm test -- tests/data/dashboard-summary.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/data/dashboard-summary.ts tests/data/dashboard-summary.test.ts
git commit -m "feat: add dashboard summary data helpers"
```

---

## Task 7: Add Summary API Routes

**Files:**
- Create: `app/api/account/summary/route.ts`
- Create: `app/api/partner/dashboard-summary/route.ts`
- Create: `app/api/admin/dashboard-summary/route.ts`
- Test: `tests/api/dashboard-summary-routes.test.ts`

**Step 1: Write failing route tests**

Test:

1. Account summary requires user and calls `ensureUserProfileForAuthUser` then `getCustomerDashboardSummary(profile.id)`.
2. Partner summary requires partner context and calls `getPartnerDashboardSummary(context.partner.id)`.
3. Admin summary requires admin and calls `getAdminDashboardSummary()`.

Mock `@/lib/auth/api`, `@/data/user`, and `@/data/dashboard-summary`.

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/api/dashboard-summary-routes.test.ts
```

Expected: FAIL because routes do not exist.

**Step 3: Implement account summary route**

Create `app/api/account/summary/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { getCustomerDashboardSummary } from '@/data/dashboard-summary';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const profile = await ensureUserProfileForAuthUser({
      authUserId: auth.user.id,
      email: auth.user.email,
      name:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : typeof auth.user.user_metadata?.name === 'string'
            ? auth.user.user_metadata.name
            : null,
    });

    const summary = await getCustomerDashboardSummary(profile.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Step 4: Implement partner summary route**

Create `app/api/partner/dashboard-summary/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireApiPartnerContext } from '@/lib/auth/api';
import { getPartnerDashboardSummary } from '@/data/dashboard-summary';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPartnerContext(request);
    if (auth.response) return auth.response;

    const summary = await getPartnerDashboardSummary(auth.context.partner.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Step 5: Implement admin summary route**

Create `app/api/admin/dashboard-summary/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/auth/api';
import { getAdminDashboardSummary } from '@/data/dashboard-summary';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const summary = await getAdminDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Step 6: Run tests**

Run:

```bash
npm test -- tests/api/dashboard-summary-routes.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add app/api/account/summary/route.ts app/api/partner/dashboard-summary/route.ts app/api/admin/dashboard-summary/route.ts tests/api/dashboard-summary-routes.test.ts
git commit -m "feat: add dashboard summary API routes"
```

---

## Task 8: Replace Dashboard Placeholder Stats

**Files:**
- Modify: `app/account/page.tsx`
- Modify: `app/partner/page.tsx`
- Modify: `app/admin/page.tsx`
- Test: `tests/ui/dashboard-summary.test.tsx`

**Step 1: Write failing UI tests**

Test expected rendering:

1. Account page displays non-zero summary from mocked `getCustomerDashboardSummary`.
2. Partner dashboard fetches `/api/partner/dashboard-summary` and displays monthly paid orders/revenue.
3. Admin dashboard fetches `/api/admin/dashboard-summary` and displays pending partner/listing reviews and revenue.

**Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/ui/dashboard-summary.test.tsx
```

Expected: FAIL because pages still render placeholders or old API calls.

**Step 3: Update account page**

Modify `app/account/page.tsx`:

- Import `ensureUserProfileForAuthUser` and `getCustomerDashboardSummary`.
- After user/profile resolution, fetch summary.
- Replace hardcoded stat values.

Implementation shape:

```ts
const profile = await ensureUserProfileForAuthUser({ ... });
const summary = await getCustomerDashboardSummary(profile.id);
```

Replace:

```tsx
<StatCard label="Total Pesanan" value="0" helper="Riwayat booking Anda" />
<StatCard label="Tiket Aktif" value="0" helper="Siap digunakan saat check-in" />
<StatCard label="Menunggu Pembayaran" value="0" helper="Selesaikan sebelum kedaluwarsa" />
```

with:

```tsx
<StatCard label="Total Pesanan" value={summary.totalOrders} helper="Riwayat booking Anda" />
<StatCard label="Tiket Aktif" value={summary.activeTickets} helper="Siap digunakan saat check-in" />
<StatCard label="Menunggu Pembayaran" value={summary.pendingPaymentOrders} helper="Selesaikan sebelum kedaluwarsa" />
```

**Step 4: Update partner dashboard**

Modify `app/partner/page.tsx`:

- Remove separate listing count state if no longer needed.
- Fetch `/api/partner/me` for context display.
- Fetch `/api/partner/dashboard-summary` for stats.
- Render:
  - `activeListings`
  - `draftReviewListings`
  - `monthlyPaidOrders`
  - `estimatedMonthlyRevenue`
- Optionally mention `requestedBookings`/`pendingPaymentBookings` in helper text.

**Step 5: Update admin dashboard**

Modify `app/admin/page.tsx`:

- Change `DashboardStats` shape to admin summary shape.
- Fetch `/api/admin/dashboard-summary` only.
- Replace `pendingReview` with combined pending review or separate cards.

Recommended cards:

```ts
const statCards = [
  { key: 'totalPartners', label: 'Total Partner', ... },
  { key: 'totalListings', label: 'Total Pengalaman', ... },
  { key: 'pendingPartnerReviews', label: 'Partner Menunggu Review', ... },
  { key: 'pendingListingReviews', label: 'Pengalaman Menunggu Review', ... },
  { key: 'grossRevenue', label: 'Pendapatan Kotor', format: formatIDR, ... },
];
```

Use responsive grid that supports 5 cards, e.g. `lg:grid-cols-5` or keep `lg:grid-cols-4` and let wrap.

**Step 6: Run UI tests**

Run:

```bash
npm test -- tests/ui/dashboard-summary.test.tsx
```

Expected: PASS.

**Step 7: Commit**

```bash
git add app/account/page.tsx app/partner/page.tsx app/admin/page.tsx tests/ui/dashboard-summary.test.tsx
git commit -m "feat: show real dashboard summary stats"
```

---

## Task 9: Full Verification

**Files:**
- No code changes expected unless fixing failures.

**Step 1: Typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

**Step 2: Lint**

Run:

```bash
npm run lint
```

Expected: exits 0 with warnings under configured threshold.

**Step 3: Test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

**Step 4: Build**

Run:

```bash
npm run build
```

Expected: build succeeds. If environment/database prevents build, record exact failure and whether it is unrelated to code changes.

**Step 5: Commit verification fixes if any**

```bash
git status --short
git add <changed-files>
git commit -m "chore: fix dashboard priority verification issues"
```

---

## Task 10: Manual QA Checklist

**Files:**
- No code changes expected unless fixing QA issues.

**Step 1: Start dev server**

Run:

```bash
npm run dev
```

**Step 2: Customer QA**

Verify:

- `/account` stats match seeded/current data.
- `/account/tickets` shows tickets for paid orders if present.
- Unauthenticated user redirects to `/auth/login`.

**Step 3: Partner QA**

Verify:

- `/partner` shows real summary.
- `/partner/listings` loads own listings.
- Attempt to call `/api/partner/<other-id>/listings` returns 403.
- Attempt to update another listing sessions returns 403.

**Step 4: Admin QA**

Verify:

- `/admin` shows summary from new endpoint.
- Admin user can access `/admin`, `/admin/partners`, `/admin/listings`.
- Admin user is redirected away from `/admin/users`, `/admin/audit`, `/admin/settings`.
- Super Admin user can access those Super Admin routes.

**Step 5: Scanner QA**

Verify:

- Anonymous POST to `/api/scanner/validate` returns 401.
- Partner with valid session/ticket can validate.
- Wrong partner/session returns `WRONG_SCOPE`.

**Step 6: Record QA result**

Update the final response with exact commands and QA outcomes.
