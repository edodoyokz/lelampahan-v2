# Dashboard Priority Security & Summary Design

## Context

This design covers the priority D scope from the UI/dashboard audit: fix security/correctness issues and replace placeholder dashboard statistics with real summary data for customer, partner, admin, and super admin access flows.

## Goals

1. Prevent partner users from reading or mutating listings/sessions that belong to another partner.
2. Fix customer ticket wallet data lookup so tickets are resolved through `UserProfile.id`, not Supabase auth user id.
3. Restrict Super Admin pages from direct URL access by regular Admin users.
4. Require authentication and partner scope validation for scanner validation.
5. Replace placeholder dashboard stats with real server-side/API summary data.

## Non-Goals

- Full partner edit listing implementation.
- Full customer order detail page.
- Full visual QR scanner implementation.
- Super Admin users/audit/settings feature completion beyond access guard.
- Large RBAC refactor.

## Approach

Use centralized auth guard helpers rather than scattering ad-hoc checks in route handlers. Summary data should be computed server-side through small data helpers and role-specific endpoints/pages.

## Authorization Design

Add reusable helpers in `src/lib/auth/api.ts` or a new auth guard module:

- `requireApiSuperAdmin(request)`
- `requireApiPartnerContext(request)`
- `requirePartnerOwnership(request, partnerId)`
- `requireListingOwnership(request, listingId)`

Use these guards in:

- `GET /api/partner/[id]/listings`
- `POST /api/listing`
- `POST /api/listing/[id]/submit`
- `GET/PUT /api/listing/[id]/sessions`
- `POST /api/scanner/validate`

For `POST /api/listing`, do not trust `partnerId` sent by the browser. Resolve the authenticated user’s partner context server-side and override/validate the input partner id.

For Super Admin pages, update middleware to block regular Admin users from:

- `/admin/users`
- `/admin/audit`
- `/admin/settings`

## Customer Ticket Correctness

`/account/tickets` currently calls `findTicketsByUser(user.id)`, but tickets are related through orders that use `UserProfile.id`. The page must resolve or ensure the user profile first, then call `findTicketsByUser(profile.id)`.

## Scanner Design

`POST /api/scanner/validate` must require an authenticated user with partner context. The API should derive `staffId` from the authenticated profile/user context, not trust an arbitrary `staffId` from the request body. The endpoint should validate ticket/session/listing scope before check-in.

The scanner UI can remain mostly unchanged in this scope, but manual validation should no longer be represented as real success unless wired to the API in a follow-up/core-flow task. If wired now, it should call the API and show real result messages.

## Dashboard Summary Design

### Customer Summary

Data source should return:

```ts
{
  totalOrders: number;
  activeTickets: number;
  pendingPaymentOrders: number;
}
```

Used by `/account`.

### Partner Summary

Endpoint:

```txt
GET /api/partner/dashboard-summary
```

Response:

```ts
{
  activeListings: number;
  draftReviewListings: number;
  requestedBookings: number;
  pendingPaymentBookings: number;
  monthlyPaidOrders: number;
  estimatedMonthlyRevenue: number;
}
```

All counts are scoped to the authenticated partner context.

### Admin Summary

Endpoint:

```txt
GET /api/admin/dashboard-summary
```

Response:

```ts
{
  totalPartners: number;
  totalListings: number;
  pendingPartnerReviews: number;
  pendingListingReviews: number;
  grossRevenue: number;
}
```

Requires admin or super admin.

## Error Handling

Dashboards should not silently convert failed summary fetches into zero values. Show clear error alerts while preserving loading skeletons.

## Testing Strategy

Add tests for:

- Partner ownership guards.
- Listing ownership guards.
- Super Admin middleware route restriction.
- Customer ticket lookup through user profile.
- Customer, partner, and admin summary calculations.

Run full verification:

```bash
npm run typecheck
npm run lint
npm test
```
