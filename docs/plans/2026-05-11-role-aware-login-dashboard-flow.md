# Role-Aware Login Dashboard Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make login redirect users to the correct dashboard for their role/context, add logout and role-aware dashboard links, and tighten partner route access.

**Architecture:** Add a small auth destination helper shared by client UI and tests, add an API endpoint to resolve the current user's post-login destination using Supabase auth + partner membership, then update the login page and marketplace header. Partner access should be enforced by checking partner membership, not only Supabase authentication. All behavior changes must be test-first.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase SSR/browser clients, Prisma, Vitest, Testing Library.

---

### Task 1: Add role destination helper

**Files:**
- Create: `src/lib/auth/destinations.ts`
- Create: `tests/lib/auth-destinations.test.ts`

**Step 1: Write failing tests**

Create `tests/lib/auth-destinations.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveDashboardDestination } from '@/lib/auth/destinations';

describe('resolveDashboardDestination', () => {
  it('sends admins to admin dashboard', () => {
    expect(resolveDashboardDestination({ role: 'ADMIN', hasPartnerMembership: false })).toBe('/admin');
  });

  it('sends super admins to admin dashboard', () => {
    expect(resolveDashboardDestination({ role: 'SUPER_ADMIN', hasPartnerMembership: false })).toBe('/admin');
  });

  it('sends partner members to partner dashboard', () => {
    expect(resolveDashboardDestination({ role: 'CUSTOMER', hasPartnerMembership: true })).toBe('/partner');
  });

  it('sends customers without partner membership to account dashboard', () => {
    expect(resolveDashboardDestination({ role: 'CUSTOMER', hasPartnerMembership: false })).toBe('/account');
  });
});
```

**Step 2: Run failing test**

Run:

```bash
npm test -- tests/lib/auth-destinations.test.ts
```

Expected: fail because `@/lib/auth/destinations` does not exist.

**Step 3: Implement helper**

Create `src/lib/auth/destinations.ts`:

```ts
import type { AppRole } from '@/lib/auth/roles';

export function resolveDashboardDestination(input: {
  role: AppRole;
  hasPartnerMembership: boolean;
}) {
  if (input.role === 'ADMIN' || input.role === 'SUPER_ADMIN') return '/admin';
  if (input.hasPartnerMembership) return '/partner';
  return '/account';
}
```

**Step 4: Verify**

Run:

```bash
npm test -- tests/lib/auth-destinations.test.ts
npm run typecheck
npm run lint
```

Expected: pass.

**Step 5: Commit**

```bash
git add src/lib/auth/destinations.ts tests/lib/auth-destinations.test.ts
git commit -m "feat: add role dashboard destination helper"
```

---

### Task 2: Add current-user dashboard API endpoint

**Files:**
- Create: `app/api/auth/dashboard-destination/route.ts`
- Create: `tests/api/auth-dashboard-destination.test.ts`

**Step 1: Write failing tests**

Create `tests/api/auth-dashboard-destination.test.ts` using module mocks:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getApiUser = vi.fn();
const findPartnerContextByAuthUserId = vi.fn();

vi.mock('@/lib/auth/api', () => ({ getApiUser: (request: Request) => getApiUser(request) }));
vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: (authUserId: string) => findPartnerContextByAuthUserId(authUserId),
}));

const { GET } = await import('@/app/api/auth/dashboard-destination/route');

describe('GET /api/auth/dashboard-destination', () => {
  beforeEach(() => {
    getApiUser.mockReset();
    findPartnerContextByAuthUserId.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    getApiUser.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));

    expect(response.status).toBe(401);
  });

  it('returns /admin for admin users', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-admin', app_metadata: { role: 'ADMIN' }, user_metadata: {} });

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/admin' });
    expect(findPartnerContextByAuthUserId).not.toHaveBeenCalled();
  });

  it('returns /partner for customer users with partner membership', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-partner', app_metadata: { role: 'CUSTOMER' }, user_metadata: {} });
    findPartnerContextByAuthUserId.mockResolvedValue({ partner: { id: 'p1' } });

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/partner' });
  });

  it('returns /account for customers without partner membership', async () => {
    getApiUser.mockResolvedValue({ id: 'auth-customer', app_metadata: { role: 'CUSTOMER' }, user_metadata: {} });
    findPartnerContextByAuthUserId.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/auth/dashboard-destination'));
    const body = await response.json();

    expect(body).toEqual({ destination: '/account' });
  });
});
```

**Step 2: Run failing test**

```bash
npm test -- tests/api/auth-dashboard-destination.test.ts
```

Expected: fail because route does not exist.

**Step 3: Implement route**

Create `app/api/auth/dashboard-destination/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { findPartnerContextByAuthUserId } from '@/data/partner';
import { getApiUser } from '@/lib/auth/api';
import { getUserRole } from '@/lib/auth/roles';
import { resolveDashboardDestination } from '@/lib/auth/destinations';

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getUserRole(user);
  const hasPartnerMembership =
    role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? false
      : Boolean(await findPartnerContextByAuthUserId(user.id));

  return NextResponse.json({
    destination: resolveDashboardDestination({ role, hasPartnerMembership }),
  });
}
```

**Step 4: Verify**

```bash
npm test -- tests/api/auth-dashboard-destination.test.ts
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/api/auth/dashboard-destination/route.ts tests/api/auth-dashboard-destination.test.ts
git commit -m "feat: expose dashboard destination API"
```

---

### Task 3: Redirect login to role dashboard

**Files:**
- Modify: `app/auth/login/page.tsx`
- Modify: `tests/app/auth/login-page.test.tsx`

**Step 1: Extend tests**

Update the Supabase mock so `signInWithPassword` is assertable, and add fetch/window location tests.

Add tests:

```ts
it('redirects to dashboard destination after successful login', async () => {
  process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'false';
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { assign },
    writable: true,
  });
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ destination: '/admin' }) });

  render(<LoginPage />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@lelampahan.test' } });
  fireEvent.change(screen.getByLabelText('Kata sandi'), { target: { value: 'Password123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

  await waitFor(() => expect(assign).toHaveBeenCalledWith('/admin'));
});

it('falls back to /account when dashboard destination lookup fails', async () => {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { assign },
    writable: true,
  });
  global.fetch = vi.fn().mockResolvedValue({ ok: false });

  render(<LoginPage />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@lelampahan.test' } });
  fireEvent.change(screen.getByLabelText('Kata sandi'), { target: { value: 'Password123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

  await waitFor(() => expect(assign).toHaveBeenCalledWith('/account'));
});
```

**Step 2: Run failing tests**

```bash
npm test -- tests/app/auth/login-page.test.tsx
```

Expected: fail because login always sets `window.location.href = '/'`.

**Step 3: Implement login redirect**

In `app/auth/login/page.tsx`:

- Add helper:

```ts
async function getDashboardDestination() {
  const response = await fetch('/api/auth/dashboard-destination', { cache: 'no-store' });
  if (!response.ok) return '/account';
  const body = await response.json();
  return typeof body.destination === 'string' ? body.destination : '/account';
}
```

- Replace:

```ts
window.location.href = '/';
```

with:

```ts
window.location.assign(await getDashboardDestination());
```

**Step 4: Verify**

```bash
npm test -- tests/app/auth/login-page.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add app/auth/login/page.tsx tests/app/auth/login-page.test.tsx
git commit -m "feat: redirect login by dashboard destination"
```

---

### Task 4: Add logout and role-aware dashboard link to marketplace header

**Files:**
- Modify: `src/components/layout/marketplace-header.tsx`
- Modify: `app/(marketplace)/layout.tsx`
- Modify: `tests/components/layout/marketplace-header.test.tsx`
- Modify: `tests/app/marketplace-layout.test.tsx`

**Step 1: Write failing tests**

Update header tests:

```ts
it('shows dashboard link and logout for authenticated users', () => {
  render(<MarketplaceHeader user={{ name: 'Admin Lelampahan', dashboardHref: '/admin' }} />);

  expect(screen.getAllByText('Admin Lelampahan').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Keluar').length).toBeGreaterThanOrEqual(1);
});
```

Update layout test to expect dashboard href from destination helper if practical.

**Step 2: Run failing tests**

```bash
npm test -- tests/components/layout/marketplace-header.test.tsx tests/app/marketplace-layout.test.tsx
```

Expected: fail because header user does not support `dashboardHref` or logout.

**Step 3: Implement**

In `src/components/layout/marketplace-header.tsx`:

- Change prop:

```ts
user?: { name: string; avatarUrl?: string; dashboardHref?: string } | null;
```

- Import browser Supabase client.
- Add sign out handler:

```ts
async function handleLogout() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
  window.location.assign('/');
}
```

- When `user` exists, show:
  - avatar/name
  - `<Link href={user.dashboardHref ?? '/account'}>Dashboard</Link>`
  - `<button type="button" onClick={handleLogout}>Keluar</button>`

Implement in both desktop and mobile drawer sections.

In `app/(marketplace)/layout.tsx`:

- Resolve dashboard href server-side using `getUserRole`, `findPartnerContextByAuthUserId`, and `resolveDashboardDestination`.
- Pass `dashboardHref` into `MarketplaceHeader`.

**Step 4: Verify**

```bash
npm test -- tests/components/layout/marketplace-header.test.tsx tests/app/marketplace-layout.test.tsx
npm run typecheck
npm run lint
```

**Step 5: Commit**

```bash
git add src/components/layout/marketplace-header.tsx app/(marketplace)/layout.tsx tests/components/layout/marketplace-header.test.tsx tests/app/marketplace-layout.test.tsx
git commit -m "feat: add dashboard link and logout to header"
```

---

### Task 5: Tighten partner route guard by membership

**Files:**
- Create: `app/partner/partner-auth-guard.tsx`
- Modify: `app/partner/layout.tsx`
- Create: `tests/app/partner-layout.test.tsx`

**Step 1: Write failing tests**

Test desired behavior by mocking `getCurrentUser`, `findPartnerContextByAuthUserId`, and `redirect`:

```ts
it('redirects unauthenticated users to login', async () => { ... });
it('redirects authenticated users without partner membership to account', async () => { ... });
it('renders partner shell for users with partner membership', async () => { ... });
```

**Step 2: Run failing tests**

```bash
npm test -- tests/app/partner-layout.test.tsx
```

Expected: fail because partner layout only renders shell.

**Step 3: Implement guard**

Create server guard component or make `app/partner/layout.tsx` async:

```ts
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/client';
import { findPartnerContextByAuthUserId } from '@/data/partner';

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const context = await findPartnerContextByAuthUserId(user.id);
  if (!context) redirect('/account');

  return <PartnerShell>{children}</PartnerShell>;
}
```

**Step 4: Verify**

```bash
npm test -- tests/app/partner-layout.test.tsx
npm run typecheck
npm run lint
npm test
```

**Step 5: Commit**

```bash
git add app/partner/layout.tsx tests/app/partner-layout.test.tsx
git commit -m "fix: require partner membership for partner portal"
```

---

### Task 6: Final verification and integration

**Files:**
- No new files.

**Step 1: Run full verification**

```bash
npm run typecheck
npm run lint
npm test
git diff --check
```

Expected: all pass.

**Step 2: Manual QA checklist**

Run app and verify:

```bash
npm run dev
```

Demo login expected redirects:

- `customer@lelampahan.test` → `/account`
- `partner@lelampahan.test` → `/partner`
- `admin@lelampahan.test` → `/admin`
- `superadmin@lelampahan.test` → `/admin`

Also verify:

- Header shows logged-in name after redirect.
- Header dashboard link points to the correct dashboard.
- Header logout returns to `/` and clears session.
- Customer visiting `/partner` redirects to `/account`.
- Unauthenticated visiting `/partner` redirects to `/auth/login`.

**Step 3: Commit any final fixes**

```bash
git status --short
git add <changed files>
git commit -m "fix: polish role-aware login flow"
```

**Step 4: Complete branch**

Use `superpowers:finishing-a-development-branch` and choose whether to merge locally or push PR.
