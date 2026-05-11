# Full Role Portal UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete frontend portal UI for customer, partner, admin, and super admin roles without large backend expansion.

**Architecture:** Add small shared portal UI primitives, then upgrade each role area incrementally. Use existing API routes and data contracts; where backend data is not available, render explicit placeholder UI. Keep tests focused on visible UI, role-aware navigation, loading/empty/error states, and status filtering.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Supabase SSR/browser auth, Prisma-backed API routes, Vitest, Testing Library.

---

### Task 1: Shared portal UI primitives

**Files:**
- Create: `src/components/ui/page-header.tsx`
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/quick-action-card.tsx`
- Create: `src/components/ui/role-badge.tsx`
- Create: `src/components/ui/status-filter-tabs.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `tests/components/ui/portal-primitives.test.tsx`

**Step 1: Write failing tests**

Create `tests/components/ui/portal-primitives.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { RoleBadge } from '@/components/ui/role-badge';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('portal UI primitives', () => {
  it('renders PageHeader title, description and action', () => {
    render(<PageHeader title="Dashboard" description="Ringkasan akun" action={{ label: 'Buat', href: '/new' }} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ringkasan akun')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buat' })).toHaveAttribute('href', '/new');
  });

  it('renders StatCard label and value', () => {
    render(<StatCard label="Total Pesanan" value="3" helper="Bulan ini" />);
    expect(screen.getByText('Total Pesanan')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Bulan ini')).toBeInTheDocument();
  });

  it('renders QuickActionCard as link', () => {
    render(<QuickActionCard title="Lihat Tiket" description="Buka tiket aktif" href="/account/tickets" />);
    expect(screen.getByRole('link', { name: /Lihat Tiket/i })).toHaveAttribute('href', '/account/tickets');
  });

  it('renders RoleBadge for super admin', () => {
    render(<RoleBadge role="SUPER_ADMIN" />);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('renders status filter tabs and active state', () => {
    render(
      <StatusFilterTabs
        value="PUBLISHED"
        options={[{ label: 'Semua', value: 'ALL' }, { label: 'Terbit', value: 'PUBLISHED' }]}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terbit' })).toHaveAttribute('aria-pressed', 'true');
  });
});
```

**Step 2: Run failing test**

```bash
npm test -- tests/components/ui/portal-primitives.test.tsx
```

Expected: fail because components do not exist.

**Step 3: Implement components**

Create simple typed Tailwind components. Keep them dependency-light.

`PageHeader` should support `title`, `description`, `eyebrow`, `action`, and `children`.

`StatCard` should support `label`, `value`, `helper`, `icon`, and optional color classes.

`QuickActionCard` should be a Link card with `title`, `description`, `href`, and optional `icon`.

`RoleBadge` should map:

- `CUSTOMER` -> `Pelanggan`
- `ADMIN` -> `Admin`
- `SUPER_ADMIN` -> `Super Admin`
- `PARTNER` -> `Partner`

`StatusFilterTabs` should render buttons with `aria-pressed`.

Export all from `src/components/ui/index.ts`.

**Step 4: Verify**

```bash
npm test -- tests/components/ui/portal-primitives.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add src/components/ui/page-header.tsx src/components/ui/stat-card.tsx src/components/ui/quick-action-card.tsx src/components/ui/role-badge.tsx src/components/ui/status-filter-tabs.tsx src/components/ui/index.ts tests/components/ui/portal-primitives.test.tsx
git commit -m "feat: add shared portal UI primitives"
```

---

### Task 2: Customer dashboard UI

**Files:**
- Modify: `app/account/page.tsx`
- Test: `tests/app/account-page.test.tsx`

**Step 1: Write/extend tests**

Test authenticated dashboard renders:

- `Dashboard Akun`
- greeting with display name
- stat labels: `Total Pesanan`, `Tiket Aktif`, `Menunggu Pembayaran`
- quick action labels: `Jelajahi Pengalaman`, `Tiket Saya`, `Riwayat Pesanan`
- profile section

Mock `getCurrentUser`. If needed, keep the route redirect mock for unauthenticated behavior.

**Step 2: Run failing test**

```bash
npm test -- tests/app/account-page.test.tsx
```

Expected: fail because current account page is profile-only.

**Step 3: Implement dashboard**

Update `app/account/page.tsx`:

- Keep server-side `getCurrentUser` and redirect logic.
- Replace profile-only heading with `PageHeader`.
- Add three `StatCard` components with placeholder-safe values (`0` if no API).
- Add quick action cards.
- Keep existing profile card below dashboard content.
- Do not add backend calls in this task unless trivial and already available.

**Step 4: Verify**

```bash
npm test -- tests/app/account-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/account/page.tsx tests/app/account-page.test.tsx
git commit -m "feat: upgrade customer account dashboard UI"
```

---

### Task 3: Customer orders and tickets polish

**Files:**
- Modify: `app/account/orders/page.tsx`
- Modify: `app/account/tickets/page.tsx`
- Test: `tests/app/account-orders-page.test.tsx`
- Test: `tests/app/account-tickets-page.test.tsx`

**Step 1: Write/extend tests**

Orders tests should verify:

- page header description exists
- empty state action exists
- Indonesian status labels are used
- order card renders CTA text `Lihat Detail` or equivalent non-broken UI

Tickets tests should verify:

- `Tiket Saya` heading
- check-in guidance copy
- ticket code appears in a visual card
- empty state action remains

**Step 2: Run failing tests**

```bash
npm test -- tests/app/account-orders-page.test.tsx tests/app/account-tickets-page.test.tsx
```

**Step 3: Implement polish**

Orders:

- Use `PageHeader`.
- Add description copy.
- Add better card layout with `Lihat Detail` button disabled/placeholder if no route.
- Add subtle helper copy for paid/pending statuses.

Tickets:

- Use `PageHeader`.
- Add check-in guidance banner.
- Make ticket card include code box and session details.

**Step 4: Verify**

```bash
npm test -- tests/app/account-orders-page.test.tsx tests/app/account-tickets-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/account/orders/page.tsx app/account/tickets/page.tsx tests/app/account-orders-page.test.tsx tests/app/account-tickets-page.test.tsx
git commit -m "feat: polish customer orders and tickets UI"
```

---

### Task 4: Partner dashboard and listings UI

**Files:**
- Modify: `app/partner/page.tsx`
- Modify: `app/partner/listings/page.tsx`
- Test: `tests/app/partner-dashboard.test.tsx`
- Test: `tests/app/partner-listings-page.test.tsx`

**Step 1: Write/extend tests**

Dashboard tests:

- renders `Dashboard Partner`
- renders status/context banner
- renders stat cards `Pengalaman Aktif`, `Draft/Review`, `Pesanan Bulan Ini`, `Pendapatan Estimasi`
- renders quick actions

Listings tests:

- renders status filter tabs: `Semua`, `Draft`, `Review`, `Terbit`, `Ditolak`
- filters visible rows by selected status
- keeps create listing CTA

**Step 2: Run failing tests**

```bash
npm test -- tests/app/partner-dashboard.test.tsx tests/app/partner-listings-page.test.tsx
```

**Step 3: Implement**

Partner dashboard:

- Use shared `PageHeader`, `StatCard`, `QuickActionCard`.
- Compute active and draft/review count from existing listings response.
- Keep monthly orders/revenue as placeholder `0` with helper text.
- Add partner status banner.

Listings:

- Add `StatusFilterTabs` state.
- Filter client-side list.
- Use Indonesian labels for statuses in filters.
- Keep submit action.

**Step 4: Verify**

```bash
npm test -- tests/app/partner-dashboard.test.tsx tests/app/partner-listings-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/partner/page.tsx app/partner/listings/page.tsx tests/app/partner-dashboard.test.tsx tests/app/partner-listings-page.test.tsx
git commit -m "feat: upgrade partner dashboard and listings UI"
```

---

### Task 5: Partner bookings and scanner UI

**Files:**
- Modify: `app/partner/bookings/page.tsx`
- Modify: `app/partner/scanner/page.tsx`
- Test: `tests/app/partner-bookings-page.test.tsx`
- Test: `tests/app/partner-scanner-page.test.tsx`

**Step 1: Write/extend tests**

Bookings tests:

- renders summary labels `Permintaan`, `Menunggu Pembayaran`, `Disetujui/Selesai`
- renders existing table/cards
- confirmation modal copy remains

Scanner tests:

- renders demo note about manual validation
- renders camera action
- manual code `invalid` shows failed result
- non-empty manual code shows success result

**Step 2: Run failing tests**

```bash
npm test -- tests/app/partner-bookings-page.test.tsx tests/app/partner-scanner-page.test.tsx
```

**Step 3: Implement**

Bookings:

- Add `PageHeader`.
- Add three summary `StatCard` components derived from bookings array.
- Polish empty/error copy.

Scanner:

- Add `PageHeader`.
- Add info banner explaining demo/manual validation.
- Improve result cards and next action buttons.
- Keep current simulated validation.

**Step 4: Verify**

```bash
npm test -- tests/app/partner-bookings-page.test.tsx tests/app/partner-scanner-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/partner/bookings/page.tsx app/partner/scanner/page.tsx tests/app/partner-bookings-page.test.tsx tests/app/partner-scanner-page.test.tsx
git commit -m "feat: polish partner bookings and scanner UI"
```

---

### Task 6: Admin dashboard and review queues UI

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/partners/page.tsx`
- Modify: `app/admin/listings/page.tsx`
- Test: `tests/app/admin-dashboard.test.tsx`
- Test: `tests/app/admin-partners-page.test.tsx`
- Test: `tests/app/admin-listings-page.test.tsx`

**Step 1: Write/extend tests**

Dashboard tests:

- renders `Admin Dashboard`
- renders review queue labels
- renders pending partner/listing cards

Partners/listings tests:

- render status tabs
- filter visible rows/cards
- approve/reject modal copy remains

**Step 2: Run failing tests**

```bash
npm test -- tests/app/admin-dashboard.test.tsx tests/app/admin-partners-page.test.tsx tests/app/admin-listings-page.test.tsx
```

**Step 3: Implement**

Admin dashboard:

- Use shared primitives.
- Add review queue cards linking to `/admin/partners` and `/admin/listings`.
- Add placeholder operations note for revenue/settlements.

Admin partners/listings:

- Add `StatusFilterTabs`.
- Filter lists client-side.
- Improve mobile cards.
- Keep approve/reject behavior.

**Step 4: Verify**

```bash
npm test -- tests/app/admin-dashboard.test.tsx tests/app/admin-partners-page.test.tsx tests/app/admin-listings-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/admin/page.tsx app/admin/partners/page.tsx app/admin/listings/page.tsx tests/app/admin-dashboard.test.tsx tests/app/admin-partners-page.test.tsx tests/app/admin-listings-page.test.tsx
git commit -m "feat: upgrade admin dashboard and review queues UI"
```

---

### Task 7: Super Admin navigation and placeholder routes

**Files:**
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `app/admin/layout.tsx`
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/audit/page.tsx`
- Create: `app/admin/settings/page.tsx`
- Test: `tests/components/layout/admin-shell.test.tsx`
- Test: `tests/app/admin-super-admin-pages.test.tsx`

**Step 1: Write failing tests**

Admin shell tests:

- when `role="ADMIN"`, does not render `Pengguna`, `Audit`, `Pengaturan`
- when `role="SUPER_ADMIN"`, renders extra nav labels and `Super Admin` badge

Placeholder route tests:

- `/admin/users` renders `Manajemen Pengguna`
- `/admin/audit` renders `Audit Aktivitas`
- `/admin/settings` renders `Pengaturan Platform`
- each page includes `Super Admin`

**Step 2: Run failing tests**

```bash
npm test -- tests/components/layout/admin-shell.test.tsx tests/app/admin-super-admin-pages.test.tsx
```

**Step 3: Implement**

`AdminShell`:

- accept optional prop `role?: 'ADMIN' | 'SUPER_ADMIN'`
- default role `ADMIN`
- append super admin nav items only for `SUPER_ADMIN`
- render `RoleBadge` near shell title if super admin

`app/admin/layout.tsx`:

- make async if needed
- use `getCurrentUser` + `getUserRole`
- pass role to `AdminShell`

Placeholder pages:

- Use `PageHeader`, `Card`, `QuickActionCard` or simple cards.
- Keep content read-only.

**Step 4: Verify**

```bash
npm test -- tests/components/layout/admin-shell.test.tsx tests/app/admin-super-admin-pages.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add src/components/layout/admin-shell.tsx app/admin/layout.tsx app/admin/users/page.tsx app/admin/audit/page.tsx app/admin/settings/page.tsx tests/components/layout/admin-shell.test.tsx tests/app/admin-super-admin-pages.test.tsx
git commit -m "feat: add super admin portal UI placeholders"
```

---

### Task 8: Final verification and integration

**Files:**
- No feature files unless fixes are needed.

**Step 1: Run full verification**

```bash
npm run typecheck
npm run lint
npm test
git diff --check
```

Expected: all pass.

**Step 2: Manual QA checklist**

Run:

```bash
npm run dev
```

Verify demo accounts:

- `customer@lelampahan.test` logs in to `/account`; customer portal looks complete.
- `partner@lelampahan.test` logs in to `/partner`; partner dashboard/listings/bookings/scanner look complete.
- `admin@lelampahan.test` logs in to `/admin`; no super admin-only nav.
- `superadmin@lelampahan.test` logs in to `/admin`; super admin nav and placeholder pages appear.

Verify responsive behavior:

- mobile account tabs
- partner bottom nav
- admin drawer/sidebar

**Step 3: Commit final fixes if needed**

```bash
git status --short
git add <changed files>
git commit -m "fix: polish full role portal UI"
```

**Step 4: Complete branch**

Use `superpowers:finishing-a-development-branch`. Verify, merge to `main`, push, then clean up worktree and branch.
