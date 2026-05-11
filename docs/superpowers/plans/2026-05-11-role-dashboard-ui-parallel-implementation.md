# Role Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build correct basic dashboards for Customer, Partner, Admin, and Super Admin roles, with reliable aggregate data, role-appropriate navigation, and logout available from every dashboard shell.

**Architecture:** Add focused dashboard aggregate data modules/API routes instead of calculating dashboard stats from paginated table endpoints. Add shared dashboard topbar/logout components and tighten role guards. Keep each agent's file ownership narrow so the work can be executed in parallel with minimal conflicts.

**Tech Stack:** Next.js App Router, React/TypeScript, Prisma, Supabase SSR auth, Vitest/Testing Library, Tailwind CSS.

---

## Execution Model for Parallel Agents

Use one agent per task below. Agents may run in parallel if each agent follows the file boundaries. To reduce conflicts:
- Agent 1 owns auth/logout/shared shell files.
- Agent 2 owns admin dashboard aggregate files.
- Agent 3 owns partner dashboard aggregate files.
- Agent 4 owns partner listing/booking table correctness files.
- Agent 5 owns customer account UX files.
- Agent 6 owns status labels and call-site label-only updates.

After all agents finish, run the final integration task.

---

## File Structure Map

### Shared/Auth/Navigation
- Modify: `src/lib/auth/roles.ts` — add super-admin guard helper.
- Modify: `proxy.ts` — enforce Super Admin-only routes.
- Create: `app/api/auth/logout/route.ts` — Supabase sign-out API.
- Create: `src/components/auth/logout-button.tsx` — client logout button.
- Create: `src/components/layout/dashboard-topbar.tsx` — shared topbar.
- Modify: `src/components/layout/admin-shell.tsx` — render topbar with user/role props.
- Modify: `src/components/layout/partner-shell.tsx` — render topbar with user/partner props.
- Modify: `src/components/layout/account-shell.tsx` — render topbar and dashboard/profile nav.
- Modify: `app/admin/layout.tsx`, `app/partner/layout.tsx`, `app/account/layout.tsx` — pass identity data to shells.

### Admin Dashboard
- Create: `src/data/admin-dashboard.ts` — aggregate platform stats.
- Create: `app/api/admin/dashboard/route.ts` — admin-only dashboard endpoint.
- Modify: `app/admin/page.tsx` — consume dashboard endpoint and render real stats.
- Test: `tests/data/admin-dashboard.test.ts`.
- Test: `tests/api/admin-dashboard.test.ts`.
- Test: `tests/app/admin-dashboard.test.tsx`.

### Partner Dashboard
- Create: `src/data/partner-dashboard.ts` — aggregate partner stats.
- Create: `app/api/partner/dashboard/route.ts` — partner dashboard endpoint.
- Modify: `app/partner/page.tsx` — consume dashboard endpoint and render status-aware UI.
- Test: `tests/data/partner-dashboard.test.ts`.
- Test: `tests/api/partner-dashboard.test.ts`.
- Test: `tests/app/partner-dashboard.test.tsx`.

### Partner Tables
- Modify: `src/data/listing.ts` — add optional status filter to partner listings.
- Modify: `src/data/booking.ts` — add partner booking summary function or return summary.
- Modify: `app/api/partner/[id]/listings/route.ts` — accept `status` query.
- Modify: `app/api/partner/bookings/route.ts` — return `summary`.
- Modify: `app/partner/listings/page.tsx` — send status to server; remove client page-local filter.
- Modify: `app/partner/bookings/page.tsx` — use server summary for stat cards.
- Test: `tests/data/booking-partner.test.ts`.
- Test: `tests/data/partner-listings-filter.test.ts`.
- Test: `tests/app/partner-listings-page.test.tsx`.
- Test: `tests/app/partner-bookings-page.test.tsx`.

### Customer Account
- Modify: `app/account/page.tsx` — dashboard IA and pending payment CTA.
- Modify: `app/account/orders/page.tsx` — error state and contextual action buttons.
- Create: `app/account/profile/page.tsx` — basic profile page.
- Modify: `src/components/layout/account-shell.tsx` — nav labels Dashboard/Pesanan/Tiket/Profil.
- Test: `tests/app/account-page.test.tsx`.
- Test: `tests/app/account-orders-page.test.tsx`.
- Test: `tests/components/layout/account-shell.test.tsx`.

### Status Labels
- Create: `src/lib/status-labels.ts` — Indonesian labels for order/listing/partner/ticket statuses.
- Modify dashboard pages that display raw enum statuses.
- Test: `tests/lib/status-labels.test.ts`.

---

## Task 1: Auth Guards, Logout, Shared Dashboard Topbar

**Agent scope:** Do not edit admin/partner/customer dashboard data logic. Only auth, shell, topbar, logout, and related tests.

**Files:**
- Modify: `src/lib/auth/roles.ts`
- Modify: `proxy.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `src/components/auth/logout-button.tsx`
- Create: `src/components/layout/dashboard-topbar.tsx`
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `src/components/layout/partner-shell.tsx`
- Modify: `src/components/layout/account-shell.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `app/partner/layout.tsx`
- Modify: `app/account/layout.tsx`
- Test: `tests/lib/auth-roles.test.ts`
- Test: `tests/components/layout/admin-shell.test.tsx`
- Test: `tests/components/layout/partner-shell.test.tsx`
- Test: `tests/components/layout/account-shell.test.tsx`

- [ ] **Step 1: Add failing role guard tests**

Add to `tests/lib/auth-roles.test.ts`:

```ts
import { canAccessSuperAdminRoute } from '@/lib/auth/roles';

it('allows only super admin to access super admin routes', () => {
  expect(canAccessSuperAdminRoute('SUPER_ADMIN')).toBe(true);
  expect(canAccessSuperAdminRoute('ADMIN')).toBe(false);
  expect(canAccessSuperAdminRoute('CUSTOMER')).toBe(false);
  expect(canAccessSuperAdminRoute(undefined)).toBe(false);
});
```

Run:

```bash
npm test -- tests/lib/auth-roles.test.ts
```

Expected: FAIL because `canAccessSuperAdminRoute` is not exported.

- [ ] **Step 2: Implement role helper**

In `src/lib/auth/roles.ts`, add:

```ts
export function canAccessSuperAdminRoute(role: AppRole | undefined): boolean {
  return role === 'SUPER_ADMIN';
}
```

Run:

```bash
npm test -- tests/lib/auth-roles.test.ts
```

Expected: PASS.

- [ ] **Step 3: Guard Super Admin routes in proxy**

Modify `proxy.ts`:

```ts
import { canAccessAdminRoute, canAccessPartnerRoute, canAccessSuperAdminRoute, getUserRole } from '@/lib/auth/roles';

const partnerRoutes = ['/partner'];
const adminRoutes = ['/admin'];
const superAdminRoutes = ['/admin/users', '/admin/audit', '/admin/settings'];
```

Inside admin route block after `const role = getUserRole(user)`:

```ts
    const role = getUserRole(user);

    if (superAdminRoutes.some((route) => pathname.startsWith(route)) && !canAccessSuperAdminRoute(role)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (!canAccessAdminRoute(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
```

- [ ] **Step 4: Add logout API route**

Create `app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Add logout button component**

Create `src/components/auth/logout-button.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={handleLogout}>
      Keluar
    </Button>
  );
}
```

- [ ] **Step 6: Add shared topbar component**

Create `src/components/layout/dashboard-topbar.tsx`:

```tsx
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { RoleBadge } from '@/components/ui/role-badge';
import type { AppRole } from '@/lib/auth/roles';

interface DashboardTopbarProps {
  title: string;
  userLabel: string;
  role: AppRole | 'PARTNER';
  partnerName?: string;
}

export function DashboardTopbar({ title, userLabel, role, partnerName }: DashboardTopbarProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/" className="text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick">
          ← Marketplace
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-lelampahan-earth">{title}</h1>
          {role === 'PARTNER' ? (
            <span className="rounded-full bg-lelampahan-cream px-2 py-0.5 text-xs font-medium text-lelampahan-earth">Partner</span>
          ) : (
            <RoleBadge role={role} />
          )}
        </div>
        {partnerName && <p className="mt-1 text-sm text-gray-500">{partnerName}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="max-w-[220px] truncate text-sm text-gray-600">{userLabel}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Pass user props into shells**

Update shell prop interfaces:

```ts
userLabel: string;
```

For `PartnerShell`, also accept:

```ts
partnerName?: string;
```

Render `<DashboardTopbar />` at top of each shell's main content.

- [ ] **Step 8: Update layouts to pass identity**

In `app/admin/layout.tsx`, redirect unauthenticated users defensively and pass email/name:

```tsx
import { redirect } from 'next/navigation';

function getUserLabel(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : user.email ?? 'Admin';
}
```

Use:

```tsx
if (!user) redirect('/auth/login');
<AdminShell role={role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'} userLabel={getUserLabel(user)}>
```

In `app/partner/layout.tsx`, pass `userLabel` and `context.partner.name`.

In `app/account/layout.tsx`, fetch current user, redirect to login if missing, and pass `userLabel`.

- [ ] **Step 9: Update shell tests for logout/topbar**

Update existing shell tests to expect `Keluar` and `Marketplace`. Example in `tests/components/layout/account-shell.test.tsx`:

```tsx
expect(screen.getByText('Keluar')).toBeInTheDocument();
expect(screen.getByText('← Marketplace')).toBeInTheDocument();
```

Mock `next/navigation` router if needed:

```ts
vi.mock('next/navigation', () => ({
  usePathname: () => '/account',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
```

Run:

```bash
npm test -- tests/lib/auth-roles.test.ts tests/components/layout/admin-shell.test.tsx tests/components/layout/partner-shell.test.tsx tests/components/layout/account-shell.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 10: Commit Task 1**

```bash
git add src/lib/auth/roles.ts proxy.ts app/api/auth/logout/route.ts src/components/auth/logout-button.tsx src/components/layout/dashboard-topbar.tsx src/components/layout/admin-shell.tsx src/components/layout/partner-shell.tsx src/components/layout/account-shell.tsx app/admin/layout.tsx app/partner/layout.tsx app/account/layout.tsx tests/lib/auth-roles.test.ts tests/components/layout/admin-shell.test.tsx tests/components/layout/partner-shell.test.tsx tests/components/layout/account-shell.test.tsx
git commit -m "feat: add dashboard topbar logout and role guards"
```

---

## Task 2: Admin Dashboard Aggregate API and UI

**Agent scope:** Do not edit shared shells or partner/customer files. Use new admin dashboard data file.

**Files:**
- Create: `src/data/admin-dashboard.ts`
- Create: `app/api/admin/dashboard/route.ts`
- Modify: `app/admin/page.tsx`
- Test: `tests/data/admin-dashboard.test.ts`
- Test: `tests/api/admin-dashboard.test.ts`
- Test: `tests/app/admin-dashboard.test.tsx`

- [ ] **Step 1: Write failing data test**

Create `tests/data/admin-dashboard.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getAdminDashboardStats } from '@/data/admin-dashboard';

const partnerCount = vi.fn();
const listingCount = vi.fn();
const orderCount = vi.fn();
const orderAggregate = vi.fn();

vi.mock('@/db/prisma', () => ({
  prisma: {
    partner: { count: (...args: unknown[]) => partnerCount(...args) },
    listing: { count: (...args: unknown[]) => listingCount(...args) },
    order: {
      count: (...args: unknown[]) => orderCount(...args),
      aggregate: (...args: unknown[]) => orderAggregate(...args),
    },
  },
}));

describe('getAdminDashboardStats', () => {
  beforeEach(() => {
    partnerCount.mockReset();
    listingCount.mockReset();
    orderCount.mockReset();
    orderAggregate.mockReset();
  });

  it('returns aggregate counts for admin dashboard', async () => {
    partnerCount.mockResolvedValueOnce(10).mockResolvedValueOnce(2).mockResolvedValueOnce(7).mockResolvedValueOnce(1);
    listingCount.mockResolvedValueOnce(20).mockResolvedValueOnce(3).mockResolvedValueOnce(15).mockResolvedValueOnce(2);
    orderCount.mockResolvedValueOnce(30).mockResolvedValueOnce(4).mockResolvedValueOnce(12).mockResolvedValueOnce(8);
    orderAggregate.mockResolvedValueOnce({ _sum: { totalAmount: 1250000 } });

    await expect(getAdminDashboardStats()).resolves.toEqual({
      partners: { total: 10, pendingReview: 2, approved: 7, rejected: 1 },
      listings: { total: 20, pendingReview: 3, published: 15, rejected: 2 },
      orders: { total: 30, pendingPayment: 4, paid: 12, completed: 8, revenue: 1250000 },
    });
  });
});
```

Run:

```bash
npm test -- tests/data/admin-dashboard.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 2: Implement data module**

Create `src/data/admin-dashboard.ts`:

```ts
import { OrderStatus, ReviewStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getAdminDashboardStats() {
  const [
    totalPartners,
    pendingPartners,
    approvedPartners,
    rejectedPartners,
    totalListings,
    pendingListings,
    publishedListings,
    rejectedListings,
    totalOrders,
    pendingPaymentOrders,
    paidOrders,
    completedOrders,
    revenueAggregate,
  ] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.count({ where: { status: ReviewStatus.PENDING_REVIEW } }),
    prisma.partner.count({ where: { status: ReviewStatus.APPROVED } }),
    prisma.partner.count({ where: { status: ReviewStatus.REJECTED } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: ReviewStatus.PENDING_REVIEW } }),
    prisma.listing.count({ where: { status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({ where: { status: ReviewStatus.REJECTED } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: { status: OrderStatus.PAID } }),
    prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    partners: {
      total: totalPartners,
      pendingReview: pendingPartners,
      approved: approvedPartners,
      rejected: rejectedPartners,
    },
    listings: {
      total: totalListings,
      pendingReview: pendingListings,
      published: publishedListings,
      rejected: rejectedListings,
    },
    orders: {
      total: totalOrders,
      pendingPayment: pendingPaymentOrders,
      paid: paidOrders,
      completed: completedOrders,
      revenue: revenueAggregate._sum.totalAmount ?? 0,
    },
  };
}
```

Run data test. Expected: PASS.

- [ ] **Step 3: Add API route**

Create `app/api/admin/dashboard/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getAdminDashboardStats } from '@/data/admin-dashboard';
import { requireApiAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin(request);
    if (auth.response) return auth.response;

    const stats = await getAdminDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 4: Update Admin dashboard UI**

Modify `app/admin/page.tsx` fetch to call `/api/admin/dashboard` once. Use the existing `DashboardStats` shape or replace with:

```ts
interface DashboardStats {
  partners: { total: number; pendingReview: number; approved: number; rejected: number };
  listings: { total: number; pendingReview: number; published: number; rejected: number };
  orders: { total: number; pendingPayment: number; paid: number; completed: number; revenue: number };
}
```

Stat cards should display:
- Total Partner: `stats.partners.total`
- Total Pengalaman: `stats.listings.total`
- Menunggu Review: `stats.partners.pendingReview + stats.listings.pendingReview`
- Pendapatan: `formatIDR(stats.orders.revenue)`

Remove client-side calculation from paginated listing data.

- [ ] **Step 5: Update app test**

Update `tests/app/admin-dashboard.test.tsx` so `global.fetch` returns the dashboard stats:

```ts
global.fetch = vi.fn().mockResolvedValueOnce({
  ok: true,
  json: async () => ({
    partners: { total: 5, pendingReview: 2, approved: 3, rejected: 0 },
    listings: { total: 9, pendingReview: 4, published: 5, rejected: 0 },
    orders: { total: 12, pendingPayment: 1, paid: 6, completed: 5, revenue: 900000 },
  }),
});
```

Assert `Menunggu Review` card renders value `6` and revenue `Rp 900.000`.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/data/admin-dashboard.test.ts tests/app/admin-dashboard.test.tsx
npm run typecheck
```

Commit:

```bash
git add src/data/admin-dashboard.ts app/api/admin/dashboard/route.ts app/admin/page.tsx tests/data/admin-dashboard.test.ts tests/app/admin-dashboard.test.tsx
git commit -m "feat: add real admin dashboard stats"
```

---

## Task 3: Partner Dashboard Aggregate API and Status-Aware UI

**Agent scope:** Do not edit partner listings/bookings table pages. Use new partner dashboard data file.

**Files:**
- Create: `src/data/partner-dashboard.ts`
- Create: `app/api/partner/dashboard/route.ts`
- Modify: `app/partner/page.tsx`
- Test: `tests/data/partner-dashboard.test.ts`
- Test: `tests/app/partner-dashboard.test.tsx`

- [ ] **Step 1: Write failing data test**

Create `tests/data/partner-dashboard.test.ts` with mocked prisma count/aggregate calls expecting status aggregates for one partner. The target function name must be:

```ts
getPartnerDashboardStats({ partnerId: 'p1', role: 'OWNER' })
```

Expected object:

```ts
{
  partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED', role: 'OWNER' },
  listings: { total: 4, draft: 1, pendingReview: 1, published: 2, rejected: 0 },
  bookings: { requested: 0, pendingPayment: 3, approved: 1, completed: 5, monthCount: 6 },
  revenue: { monthGross: 750000, estimatedPayout: 750000 }
}
```

Run:

```bash
npm test -- tests/data/partner-dashboard.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 2: Implement partner dashboard data module**

Create `src/data/partner-dashboard.ts`:

```ts
import { OrderStatus, ReviewStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getPartnerDashboardStats(input: { partnerId: string; role: string }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const partnerWhere = { partnerId: input.partnerId };
  const orderWhere = { session: { listing: { partnerId: input.partnerId } } };

  const [
    partner,
    totalListings,
    draftListings,
    pendingListings,
    publishedListings,
    rejectedListings,
    pendingPaymentBookings,
    approvedBookings,
    completedBookings,
    monthOrders,
    monthRevenue,
  ] = await Promise.all([
    prisma.partner.findUnique({ where: { id: input.partnerId } }),
    prisma.listing.count({ where: partnerWhere }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.DRAFT } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.PENDING_REVIEW } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.REJECTED } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.PAID } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.COMPLETED } }),
    prisma.order.count({ where: { ...orderWhere, createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({
      where: {
        ...orderWhere,
        createdAt: { gte: monthStart },
        status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  if (!partner) throw new Error('Partner not found');

  const monthGross = monthRevenue._sum.totalAmount ?? 0;

  return {
    partner: { id: partner.id, name: partner.name, status: partner.status, role: input.role },
    listings: {
      total: totalListings,
      draft: draftListings,
      pendingReview: pendingListings,
      published: publishedListings,
      rejected: rejectedListings,
    },
    bookings: {
      requested: 0,
      pendingPayment: pendingPaymentBookings,
      approved: approvedBookings,
      completed: completedBookings,
      monthCount: monthOrders,
    },
    revenue: {
      monthGross,
      estimatedPayout: monthGross,
    },
  };
}
```

This project currently exposes request-to-book statuses in UI/domain helpers but does not persist `REQUESTED` as an `OrderStatus` in Prisma. For this dashboard plan, keep `requested: 0` until a separate booking-request persistence plan is created.

- [ ] **Step 3: Add API route**

Create `app/api/partner/dashboard/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { getPartnerDashboardStats } from '@/data/partner-dashboard';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    const context = await findPartnerContextByAuthUserId(auth.user.id);
    if (!context) {
      return NextResponse.json({ error: 'Partner membership not found' }, { status: 404 });
    }

    const stats = await getPartnerDashboardStats({
      partnerId: context.partner.id,
      role: context.role,
    });

    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 4: Update Partner dashboard UI**

Modify `app/partner/page.tsx` to fetch only `/api/partner/dashboard`. Replace placeholder state with returned object. Render:
- Partner status card.
- Stat cards using `listings.published`, `listings.draft + listings.pendingReview`, `bookings.monthCount`, `formatIDR(revenue.estimatedPayout)`.
- If partner status is not `APPROVED`, show limited quick actions and explanatory message.

Use exact status handling:

```tsx
const isApproved = dashboard.partner.status === 'APPROVED';
const isRejected = dashboard.partner.status === 'REJECTED';
```

If rejected, show:

```tsx
<p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Pendaftaran partner ditolak. Hubungi admin untuk peninjauan ulang.</p>
```

If pending, show:

```tsx
<p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">Pendaftaran partner sedang menunggu review admin.</p>
```

Only show `Lihat Pesanan` and `Pindai Tiket` when `isApproved` is true.

- [ ] **Step 5: Update partner dashboard app test**

Update `tests/app/partner-dashboard.test.tsx` to mock one fetch to `/api/partner/dashboard`, assert:
- Partner name/status card.
- Real stat labels.
- Scanner CTA appears only for approved partner.

Add a second test for `PENDING_REVIEW` where scanner CTA is absent.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/data/partner-dashboard.test.ts tests/app/partner-dashboard.test.tsx
npm run typecheck
```

Commit:

```bash
git add src/data/partner-dashboard.ts app/api/partner/dashboard/route.ts app/partner/page.tsx tests/data/partner-dashboard.test.ts tests/app/partner-dashboard.test.tsx
git commit -m "feat: add real partner dashboard stats"
```

---

## Task 4: Partner Listings and Bookings Server-Side Filter/Summary

**Agent scope:** This task owns partner listing/booking table correctness. Do not edit `app/partner/page.tsx`.

**Files:**
- Modify: `src/data/listing.ts`
- Modify: `src/data/booking.ts`
- Modify: `app/api/partner/[id]/listings/route.ts`
- Modify: `app/api/partner/bookings/route.ts`
- Modify: `app/partner/listings/page.tsx`
- Modify: `app/partner/bookings/page.tsx`
- Test: `tests/data/partner-listings-filter.test.ts`
- Test: `tests/data/booking-partner.test.ts`
- Test: `tests/app/partner-listings-page.test.tsx`
- Test: `tests/app/partner-bookings-page.test.tsx`

- [ ] **Step 1: Add failing partner listing filter data test**

Create `tests/data/partner-listings-filter.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { listListingsForPartner } from '@/data/listing';

const findMany = vi.fn();
const count = vi.fn();

vi.mock('@/db/prisma', () => ({
  prisma: { listing: { findMany: (...args: unknown[]) => findMany(...args), count: (...args: unknown[]) => count(...args) } },
}));

describe('listListingsForPartner', () => {
  beforeEach(() => { findMany.mockReset(); count.mockReset(); });

  it('filters partner listings by status on the server', async () => {
    findMany.mockResolvedValueOnce([]);
    count.mockResolvedValueOnce(0);

    await listListingsForPartner('p1', 'PUBLISHED', 2, 20);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { partnerId: 'p1', status: 'PUBLISHED' },
      skip: 20,
      take: 20,
    }));
    expect(count).toHaveBeenCalledWith({ where: { partnerId: 'p1', status: 'PUBLISHED' } });
  });
});
```

Run:

```bash
npm test -- tests/data/partner-listings-filter.test.ts
```

Expected: FAIL because function signature does not support status in second arg.

- [ ] **Step 2: Implement listing status filter**

Change `src/data/listing.ts` function signature:

```ts
export async function listListingsForPartner(partnerId: string, status?: string, page?: number, pageSize?: number) {
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const where = {
    partnerId,
    ...(status ? { status: status as ReviewStatus } : {}),
  };
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.listing.count({ where }),
  ]);
  return { listings, total };
}
```

- [ ] **Step 3: Update partner listings API**

In `app/api/partner/[id]/listings/route.ts`, read status:

```ts
const status = url.searchParams.get('status') ?? undefined;
```

Call:

```ts
const { listings, total } = await listListingsForPartner(id, status, page, pageSize);
```

- [ ] **Step 4: Update partner listings page**

In `app/partner/listings/page.tsx`, add:

```ts
if (statusFilter !== 'ALL') params.set('status', statusFilter);
```

Update effect dependencies to include `statusFilter`.

Remove:

```ts
const filteredListings = statusFilter === 'ALL' ? listings : listings.filter((listing) => listing.status === statusFilter);
```

Pass `data={listings}` to `DataTable`.

- [ ] **Step 5: Add booking summary data helper**

In `src/data/booking.ts`, add:

```ts
export async function getPartnerBookingSummary(partnerId: string) {
  const where = { session: { listing: { partnerId } } };
  const [pendingPayment, approved, completed] = await Promise.all([
    prisma.order.count({ where: { ...where, status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: { ...where, status: OrderStatus.PAID } }),
    prisma.order.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
  ]);
  return { requested: 0, pendingPayment, approved, completed };
}
```

The `requested` count is intentionally `0` because there is no persisted booking request table/status in the current Prisma schema. Do not cast non-OrderStatus strings into `OrderStatus`.

- [ ] **Step 6: Update partner bookings API**

In `app/api/partner/bookings/route.ts`, import helper and return summary:

```ts
import { findOrdersByPartnerId, getPartnerBookingSummary } from '@/data/booking';
```

After fetching orders:

```ts
const summary = await getPartnerBookingSummary(context.partner.id);
return NextResponse.json({ orders, total, summary });
```

- [ ] **Step 7: Update partner bookings page**

Add state:

```ts
const [summary, setSummary] = useState({ requested: 0, pendingPayment: 0, approved: 0, completed: 0 });
```

After JSON parse:

```ts
setSummary(data.summary ?? { requested: 0, pendingPayment: 0, approved: 0, completed: 0 });
```

Replace page-local stat counts with summary values:

```tsx
<StatCard label="Permintaan" value={summary.requested} />
<StatCard label="Menunggu Pembayaran" value={summary.pendingPayment} />
<StatCard label="Disetujui/Selesai" value={summary.approved + summary.completed} />
```

- [ ] **Step 8: Verify and commit**

Run:

```bash
npm test -- tests/data/partner-listings-filter.test.ts tests/data/booking-partner.test.ts tests/app/partner-listings-page.test.tsx tests/app/partner-bookings-page.test.tsx
npm run typecheck
```

Commit:

```bash
git add src/data/listing.ts src/data/booking.ts app/api/partner/[id]/listings/route.ts app/api/partner/bookings/route.ts app/partner/listings/page.tsx app/partner/bookings/page.tsx tests/data/partner-listings-filter.test.ts tests/data/booking-partner.test.ts tests/app/partner-listings-page.test.tsx tests/app/partner-bookings-page.test.tsx
git commit -m "fix: use server-side partner filters and summaries"
```

---

## Task 5: Customer Account Navigation and Order UX

**Agent scope:** Own account pages and account shell. Coordinate with Task 1 if both modify account shell; if Task 1 has already landed, preserve topbar props.

**Files:**
- Modify: `src/components/layout/account-shell.tsx`
- Modify: `app/account/page.tsx`
- Modify: `app/account/orders/page.tsx`
- Create: `app/account/profile/page.tsx`
- Test: `tests/components/layout/account-shell.test.tsx`
- Test: `tests/app/account-page.test.tsx`
- Test: `tests/app/account-orders-page.test.tsx`

- [ ] **Step 1: Update account nav labels**

In `src/components/layout/account-shell.tsx`, change nav to:

```ts
const accountNavItems: AccountNavItem[] = [
  { label: 'Dashboard', href: '/account', icon: ... },
  { label: 'Pesanan', href: '/account/orders', icon: ... },
  { label: 'Tiket', href: '/account/tickets', icon: ... },
  { label: 'Profil', href: '/account/profile', icon: ... },
];
```

Keep exact active behavior:

```ts
if (href === '/account') return pathname === '/account';
return pathname.startsWith(href);
```

- [ ] **Step 2: Create profile page**

Create `app/account/profile/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/lib/supabase/client';

export default async function AccountProfileDetailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pengguna';

  const email = user.email || '-';

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Akun" description="Informasi dasar akun Lelampahan Anda." />
      <Card variant="elevated" padding="lg">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Nama" value={displayName} readOnly className="bg-gray-50 cursor-default" />
          <Input label="Email" value={email} readOnly className="bg-gray-50 cursor-default" />
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Informasi profil dikelola melalui akun autentikasi Anda. Hubungi admin jika perlu mengubah data.
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Add customer order error state**

In `app/account/orders/page.tsx`, add:

```ts
const [error, setError] = useState('');
```

In fetch:

```ts
if (!res.ok) {
  setError('Gagal memuat pesanan. Coba lagi beberapa saat lagi.');
  return;
}
```

In catch:

```ts
setError('Gagal memuat pesanan. Coba lagi beberapa saat lagi.');
```

Before empty state render:

```tsx
{error ? (
  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
) : orders.length === 0 ? (...)
```

- [ ] **Step 4: Replace disabled order action**

In `app/account/orders/page.tsx`, replace disabled button with:

```tsx
{order.status === 'PENDING_PAYMENT' ? (
  <Button variant="primary" size="sm" asChild>
    <a href="/checkout/pending">Lanjutkan Pembayaran</a>
  </Button>
) : ['PAID', 'COMPLETED'].includes(order.status) ? (
  <Button variant="ghost" size="sm" asChild>
    <a href="/account/tickets">Lihat Tiket</a>
  </Button>
) : (
  <Button variant="ghost" size="sm" asChild>
    <a href={`/l/${order.session.listing.slug}`}>Lihat Pengalaman</a>
  </Button>
)}
```

If `Button` does not support `asChild`, use `Link` wrapping `Button` as in other pages.

- [ ] **Step 5: Update account dashboard quick actions**

In `app/account/page.tsx`, keep stats and quick actions. Add a pending payment action card conditionally:

```tsx
{pendingPayments > 0 && (
  <QuickActionCard title="Lanjutkan Pembayaran" description="Selesaikan pesanan yang masih menunggu pembayaran." href="/account/orders" />
)}
```

Move detailed profile form to `/account/profile`; keep only compact profile summary on dashboard.

- [ ] **Step 6: Update tests**

Update account shell test to expect:
- `Dashboard`
- `Pesanan`
- `Tiket`
- `Profil`

Update orders page test with rejected fetch:

```ts
global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });
render(<OrderHistoryPage />);
expect(await screen.findByText('Gagal memuat pesanan. Coba lagi beberapa saat lagi.')).toBeInTheDocument();
```

Add test for pending payment action text `Lanjutkan Pembayaran`.

- [ ] **Step 7: Verify and commit**

Run:

```bash
npm test -- tests/components/layout/account-shell.test.tsx tests/app/account-page.test.tsx tests/app/account-orders-page.test.tsx
npm run typecheck
```

Commit:

```bash
git add src/components/layout/account-shell.tsx app/account/page.tsx app/account/orders/page.tsx app/account/profile/page.tsx tests/components/layout/account-shell.test.tsx tests/app/account-page.test.tsx tests/app/account-orders-page.test.tsx
git commit -m "feat: improve customer account dashboard navigation"
```

---

## Task 6: Status Labels Consistency

**Agent scope:** Own status label helper and label-only replacements. Avoid changing data fetching logic.

**Files:**
- Create: `src/lib/status-labels.ts`
- Modify: dashboard pages that render raw status labels.
- Test: `tests/lib/status-labels.test.ts`

- [ ] **Step 1: Write failing helper test**

Create `tests/lib/status-labels.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  formatListingStatusLabel,
  formatOrderStatusLabel,
  formatPartnerStatusLabel,
  formatTicketStatusLabel,
} from '@/lib/status-labels';

describe('status label helpers', () => {
  it('formats known statuses in Indonesian', () => {
    expect(formatListingStatusLabel('PENDING_REVIEW')).toBe('Menunggu Review');
    expect(formatPartnerStatusLabel('APPROVED')).toBe('Disetujui');
    expect(formatOrderStatusLabel('PENDING_PAYMENT')).toBe('Menunggu Pembayaran');
    expect(formatTicketStatusLabel('ISSUED')).toBe('Terbit');
  });

  it('falls back to raw status for unknown values', () => {
    expect(formatOrderStatusLabel('CUSTOM_STATUS')).toBe('CUSTOM_STATUS');
  });
});
```

Run:

```bash
npm test -- tests/lib/status-labels.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 2: Implement helper**

Create `src/lib/status-labels.ts`:

```ts
const listingLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Menunggu Review',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PUBLISHED: 'Terbit',
  ARCHIVED: 'Diarsipkan',
};

const partnerLabels: Record<string, string> = listingLabels;

const orderLabels: Record<string, string> = {
  DRAFT: 'Draft',
  REQUESTED: 'Permintaan',
  PARTNER_APPROVED: 'Disetujui Partner',
  PARTNER_REJECTED: 'Ditolak Partner',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  COMPLETED: 'Selesai',
  EXPIRED: 'Kedaluwarsa',
  PAYMENT_EXPIRED: 'Pembayaran Kedaluwarsa',
  CANCELLED: 'Dibatalkan',
  REFUND_REQUESTED: 'Pengembalian Dana Diajukan',
  REFUND_REJECTED: 'Pengembalian Dana Ditolak',
  PARTIALLY_REFUNDED: 'Sebagian Dana Dikembalikan',
  REFUNDED: 'Dana Dikembalikan',
  NEEDS_ADMIN_REVIEW: 'Ditinjau Admin',
};

const ticketLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  ISSUED: 'Terbit',
  CHECKED_IN: 'Sudah Check-in',
  CANCELLED: 'Dibatalkan',
  REFUNDED: 'Dana Dikembalikan',
  VOID: 'Tidak Berlaku',
};

function labelFrom(map: Record<string, string>, status: string) {
  return map[status] ?? status;
}

export function formatListingStatusLabel(status: string) {
  return labelFrom(listingLabels, status);
}

export function formatPartnerStatusLabel(status: string) {
  return labelFrom(partnerLabels, status);
}

export function formatOrderStatusLabel(status: string) {
  return labelFrom(orderLabels, status);
}

export function formatTicketStatusLabel(status: string) {
  return labelFrom(ticketLabels, status);
}
```

Run helper test. Expected: PASS.

- [ ] **Step 3: Replace raw labels in pages**

Use helper functions in:
- `app/admin/listings/page.tsx`: `formatListingStatusLabel(item.status)`
- `app/admin/partners/page.tsx`: `formatPartnerStatusLabel(item.status)` and capability status labels.
- `app/partner/listings/page.tsx`: `formatListingStatusLabel(item.status)`
- `app/partner/bookings/page.tsx`: `formatOrderStatusLabel(item.status)`
- `app/account/orders/page.tsx`: replace local `statusLabels` with `formatOrderStatusLabel`.
- `app/account/tickets/page.tsx`: `formatTicketStatusLabel(ticket.status)`

Pattern:

```tsx
<StatusBadge status={getStatusVariant(item.status)} label={formatOrderStatusLabel(item.status)} />
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/lib/status-labels.test.ts tests/app/account-orders-page.test.tsx tests/app/account-tickets-page.test.tsx tests/app/partner-bookings-page.test.tsx tests/app/partner-listings-page.test.tsx tests/app/admin-listings-page.test.tsx tests/app/admin-partners-page.test.tsx
npm run typecheck
```

Commit:

```bash
git add src/lib/status-labels.ts app/admin/listings/page.tsx app/admin/partners/page.tsx app/partner/listings/page.tsx app/partner/bookings/page.tsx app/account/orders/page.tsx app/account/tickets/page.tsx tests/lib/status-labels.test.ts tests/app/account-orders-page.test.tsx tests/app/account-tickets-page.test.tsx tests/app/partner-bookings-page.test.tsx tests/app/partner-listings-page.test.tsx tests/app/admin-listings-page.test.tsx tests/app/admin-partners-page.test.tsx
git commit -m "feat: standardize dashboard status labels"
```

---

## Final Integration Task

**Run after all parallel agents finish.**

- [ ] **Step 1: Inspect changed files and resolve conflicts**

Run:

```bash
git status --short
git log --oneline -8
```

If multiple agents touched the same file, inspect with:

```bash
git diff --stat HEAD~6..HEAD
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected:
- Tests pass.
- Typecheck passes.
- Lint passes.
- Build compiles. If local Prisma auth fails during static generation, record that env-specific warning and verify Vercel env is configured.

- [ ] **Step 3: Manual audit checklist**

Verify in code/tests:
- Logout button exists in admin, partner, account dashboards.
- `/admin/users`, `/admin/audit`, `/admin/settings` require Super Admin.
- Admin dashboard fetches `/api/admin/dashboard`, not paginated list endpoints.
- Partner dashboard fetches `/api/partner/dashboard`, not paginated list endpoints.
- Partner listings sends `status` query to server.
- Partner bookings stat cards use server `summary`.
- Account nav includes Dashboard, Pesanan, Tiket, Profil.
- Status badges use Indonesian labels.

- [ ] **Step 4: Commit integration fixes**

If integration changes were needed:

```bash
git add <changed-files>
git commit -m "fix: integrate role dashboard improvements"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```
