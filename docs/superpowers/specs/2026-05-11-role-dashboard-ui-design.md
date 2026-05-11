# Role Dashboard UI & Navigation Design

## Goal
Build correct basic dashboards for Customer, Partner, Admin, and Super Admin roles, with reliable aggregate data, role-appropriate navigation, and logout available from every dashboard shell.

## Scope
This design covers:
- Dashboard topbar/user identity/logout for account, partner, and admin areas.
- Correct role guards for Admin vs Super Admin routes.
- Real dashboard aggregates for Admin and Partner dashboards.
- Customer dashboard/navigation cleanup and usable order states.
- Partner listing/booking pagination and filtering correctness.
- Consistent Indonesian status labels across dashboard UI.

This design does not include a full visual redesign or advanced analytics charts. The goal is a correct, usable basic dashboard.

## Architecture
Use role-specific dashboard API/data modules instead of deriving dashboard stats from paginated table endpoints. Keep list/table endpoints focused on table data. Add shared navigation primitives for identity/logout and standard dashboard chrome. Preserve existing app directory route structure and UI component patterns.

## Role Access Rules
- Customer/account routes require an authenticated user at page/API level.
- Partner routes require authenticated user plus partner membership.
- Admin routes require `ADMIN` or `SUPER_ADMIN`.
- Super Admin routes require `SUPER_ADMIN` only:
  - `/admin/users`
  - `/admin/audit`
  - `/admin/settings`

## Shared Navigation and Logout
Every dashboard shell should expose:
- Link to marketplace `/`.
- Current user display name/email.
- Role badge or role label.
- Logout button.

Logout is implemented through a server API route `POST /api/auth/logout` which signs out the Supabase session and returns success. The client logout button calls the route and redirects to `/auth/login`.

## Customer Dashboard
`/account` becomes the customer dashboard, not merely profile. Account navigation labels:
- Dashboard: `/account`
- Pesanan: `/account/orders`
- Tiket: `/account/tickets`
- Profil: `/account/profile`

Dashboard content:
- Total Pesanan.
- Tiket Aktif.
- Menunggu Pembayaran.
- Quick actions for marketplace, tickets, order history, and pending payment when applicable.
- Profile summary card may remain on dashboard, but a basic profile page should exist for nav consistency.

Orders page must distinguish loading, empty, and error states. The old disabled `Lihat Detail` button must be replaced with context-aware actions: pending payment should link to checkout/pending or relevant order flow; paid/completed orders should link to tickets.

## Partner Dashboard
Add `GET /api/partner/dashboard` backed by a focused data function. Response shape:

```ts
{
  partner: { id: string; name: string; status: string; role: string },
  listings: { total: number; draft: number; pendingReview: number; published: number; rejected: number },
  bookings: { requested: number; pendingPayment: number; approved: number; completed: number; monthCount: number },
  revenue: { monthGross: number; estimatedPayout: number }
}
```

Partner dashboard UI is status-aware:
- `PENDING_REVIEW`: show review status and limit operational CTAs.
- `REJECTED`: show rejection/contact-admin state and hide scanner/booking CTAs.
- `APPROVED`: show full operational cards and quick actions.

Partner listing status filter must be server-side, not client-side over the current page. Partner booking stat cards must use summary counts from server-side aggregate data, not the currently visible page.

## Admin Dashboard
Add `GET /api/admin/dashboard` backed by a focused data function. Response shape:

```ts
{
  partners: { total: number; pendingReview: number; approved: number; rejected: number },
  listings: { total: number; pendingReview: number; published: number; rejected: number },
  orders: { total: number; pendingPayment: number; paid: number; completed: number; revenue: number }
}
```

Admin dashboard must not calculate pending review from paginated list endpoints. Super Admin-only quick actions should only render for Super Admin.

## Status Labels
Create `src/lib/status-labels.ts` with functions for customer/order/listing/partner/ticket labels. Dashboard components should display user-facing Indonesian labels instead of raw enums.

## Testing Strategy
Add regression tests for:
- Super Admin route guard.
- Logout route/button rendering.
- Admin dashboard aggregate counts.
- Partner dashboard aggregate counts and partner status-aware UI.
- Partner listing server-side status filter.
- Partner booking summary independent from current page/filter.
- Customer orders error state and context-aware actions.
- Status label helpers.

## Parallelization Boundaries
Agents should avoid shared file conflicts by using new focused files for dashboard aggregates:
- Admin dashboard data in `src/data/admin-dashboard.ts`.
- Partner dashboard data in `src/data/partner-dashboard.ts`.
- Shared auth/navigation work in layout/auth files.
- Partner table correctness work in listing/booking route/data/page files.
- Customer UX work in account route/layout files.
- Status label helper work in `src/lib/status-labels.ts` and call-site updates.
