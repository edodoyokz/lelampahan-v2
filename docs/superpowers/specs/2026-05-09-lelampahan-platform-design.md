# Lelampahan Platform Design

Date: 2026-05-09
Status: Draft for user review

## 1. Product Summary

Lelampahan is a Yogyakarta-first marketplace platform for tours, travel packages, and events. Agencies and organizers register as partners, submit offerings, sell through the platform, receive settlement reports, and check in participants using QR tickets/vouchers. Users create accounts, browse listings, book or request availability, pay via QRIS, receive tickets by email, and access tickets in their account wallet.

The platform is designed as a full multi-phase product, while the first implementation focuses on Phase 1 core commerce and operations.

## 2. MVP and Phase Scope

### Phase 1: Core Commerce and Operations

- Responsive public marketplace, PWA-friendly.
- User accounts required before checkout.
- Partner onboarding with manual admin review.
- Partner capabilities for tours and events.
- Listing creation, curation, and approval.
- Tour and event listing support.
- Sessions/schedules created manually.
- Multiple ticket types per listing/session.
- Instant confirmation for events and scheduled/open-trip tours.
- Request-to-book for private/custom tours.
- QRIS payment through a provider abstraction.
- Explicit order/payment state machines with idempotent transitions.
- Capacity reservation and concurrency protection for checkout.
- Ticket/voucher QR issued after confirmed payment.
- Signed QR ticket payloads.
- Email ticket/receipt delivery through Resend with wallet fallback.
- Partner team management and mobile-web scanner.
- Admin approval queues, transaction monitoring, refund handling, settlement reports, manual payouts, and basic analytics.
- Ledger-based finance foundation.
- Critical audit events.
- SEO-friendly public listing pages.
- Error tracking and operational monitoring for money-related flows.

### Phase 2: Growth and Content

- CMS homepage/content management.
- Promo/discount UI and active checkout support.
- Refund workflow improvements.
- WhatsApp notifications.
- Reviews and ratings UI.
- Support ticketing.
- Better content/category management.

### Phase 3: Scale and Intelligence

- Advanced analytics and event tracking.
- Automated settlement/payout.
- Advanced audit log and export.
- Public/partner API.
- Search index and recommendation/ranking improvements.
- White-label/microsite options if needed.

## 3. Architecture

Use a modular monolith based on Next.js full-stack and TypeScript. The app deploys as one Vercel project but keeps domain logic separated from UI.

Main app areas:

- Public marketplace: browse, search, detail pages, checkout.
- User account: orders, ticket/voucher wallet, refund requests.
- Partner portal: onboarding, listings, sessions, orders, booking requests, team, scanner.
- Admin backoffice: approvals, moderation, transactions, settlement, refunds, analytics.
- Payment webhook/API routes.
- Internal domain services.

Core technical stack:

- Next.js and TypeScript.
- PostgreSQL through Supabase.
- Supabase Auth.
- Prisma for schema, migration, and server-side queries.
- Supabase pooled database connection/PgBouncer for production serverless workloads on Vercel.
- Cloudflare R2 for media storage.
- Resend for transactional email.
- Payment provider abstraction for QRIS.
- Vercel Cron for lightweight cleanup and expiry jobs.
- Sentry or equivalent error tracking for application and webhook failures.

Domain modules:

- auth/profile
- partner
- listing
- booking
- payment
- ticket
- checkin
- settlement
- refund
- notification
- admin/audit

Business logic must live in domain services or server-side application services, not directly inside UI components. This keeps the monolith fast to build while preserving future extraction paths for payment, notification, search, or analytics services.

### Data Access Pattern

The default application data path is server-side access through Prisma from Next.js route handlers, server actions, and domain services. Prisma queries are responsible for applying app-layer authorization and partner scoping.

Supabase client-side access is limited to auth session handling and specific direct-access cases that benefit from Supabase policies, such as storage uploads/downloads or future realtime subscriptions. Browser code must not directly query sensitive business tables such as orders, payments, tickets, settlement, or partner data unless a dedicated RLS policy is designed for that exact use case.

This avoids confusion between two access models: Prisma is the primary business data access layer; Supabase RLS is a defense and direct-access policy layer, especially for storage and any future realtime/direct client features.

## 4. Security and Authorization

Use a hybrid authorization model:

- App-layer authorization for all sensitive business operations.
- Supabase RLS/storage policy for direct client access, private files, and storage boundaries.
- Server-side role and membership checks for partner/admin actions.
- Explicit partner_id scoping on every partner-facing query.
- Scanner staff can only scan tickets belonging to sessions/listings under their partner membership.
- Settlement, order, booking, and analytics queries must always be scoped by authorized partner or admin role.
- Payment webhook signature verification.
- Signed upload/read URLs for private R2 assets.
- Signed QR ticket payloads plus rate limiting/abuse protection for scanner endpoints.
- Audit log for critical operations.

Primary roles:

- customer/user
- partner_owner
- partner_manager
- scanner_staff
- admin
- super_admin

## 5. Product and Marketplace Model

Use a hybrid listing model.

`Listing` is the common sellable entity for tours and events. It contains shared fields:

- title, slug, description, images/banner
- partner owner
- type: tour or event
- category/tags
- location/region/venue/meeting point
- status: draft, pending_review, published, rejected, archived
- booking mode: instant_confirmation or request_to_book
- cancellation/refund policy
- SEO metadata
- simple co-branding: partner/event logo, organizer name, banner, accent color

Specific details are separated:

- `TourDetail`: itinerary, duration, included/excluded, meeting point, tour subtype such as open trip, private, or custom.
- `EventDetail`: venue, organizer info, gate/check-in settings, event-specific notes.

Each listing can have multiple `Session` records:

- start/end datetime
- capacity
- booking cutoff
- status
- session-level capacity

Recurring rules are not active in Phase 1; sessions are created manually.

Each listing/session can have multiple `TicketType` or price options:

- Regular, VIP, Early Bird, Adult, Child, Private Group, and similar.
- price
- quota/capacity optional
- sale start/end optional
- active/inactive status

Phase 1 checkout is for one listing/session at a time, but may include multiple ticket types and quantities. Multi-listing cart is future scope.

## 6. Discovery, SEO, and Taxonomy

Launch market is Yogyakarta. The data model must remain ready for multi-region Indonesia by storing province/city/area, venue, meeting point, and region-based discovery fields.

Phase 1 discovery:

- Browse published listings.
- Filter by location/area, category/type, date/session, price.
- Simple keyword search over title/description through database queries.
- Sort by newest, price, and nearest date.
- Category hierarchy with simple admin management.
- Tags for flexible discovery.

SEO is important from Phase 1:

- Clean listing slugs.
- Public crawlable listing detail pages.
- Metadata title/description.
- OpenGraph images.
- Basic category/location landing pages.
- Sitemap for published listings.
- Draft/private pages excluded from indexing.

## 7. Partner and Admin Workflow

Use a single `Partner` entity with capabilities:

- can_create_tours
- can_create_events

A partner can be a tour agency, event organizer, or both. Capabilities are approved by admin.

Phase 1 partner onboarding collects:

- business/organization name
- short description
- PIC contact
- email/phone
- address/location
- requested capabilities
- active bank account for settlement

Verification documents are modeled for future use but not required in Phase 1. Phase 1 relies on business data, bank account data, and manual admin review.

Approval workflow:

1. Partner registers.
2. Admin reviews partner.
3. Admin approves/rejects partner and capabilities.
4. Partner creates draft listing.
5. Partner submits listing for review.
6. Admin may edit/curate content.
7. Admin approves/rejects listing.
8. Approved listing becomes published.
9. Significant partner edits after publish return the listing to review.

Partner team management:

- `partner_owner`: full partner access.
- `partner_manager`: listings and orders.
- `scanner_staff`: scanner/check-in only.

Staff accounts are separate user accounts. Critical activity records the actor.

Admin backoffice Phase 1 includes:

- partner approval
- capability approval
- listing review/edit/approval
- order and payment monitoring
- manual refund handling
- settlement reports
- manual payout recording
- basic user/partner management
- basic analytics
- simple critical audit event viewer

## 8. Booking Flows

### Order and Booking State Machines

State transitions must be explicit and enforced by domain services. Invalid transitions should fail safely and be audited when relevant.

Instant confirmation order states:

```text
draft
  -> pending_payment
pending_payment
  -> paid
  -> expired
  -> cancelled
paid
  -> completed
  -> refund_requested
refund_requested
  -> refunded
  -> refund_rejected
paid/completed
  -> partially_refunded
  -> refunded
```

Request-to-book states:

```text
requested
  -> partner_approved
  -> partner_rejected
  -> expired
partner_approved
  -> pending_payment
  -> expired
pending_payment
  -> paid
  -> payment_expired
paid
  -> completed
  -> refund_requested
```

Payment state is tracked separately from order/booking state but drives transitions when provider events are confirmed. Ticket issuance only happens once per successful transition into paid status.

### Capacity and Concurrency Strategy

Capacity must be protected at the database/transaction level, not only by UI checks.

Phase 1 strategy:

- Before checkout/payment creation, create a reservation for selected session and ticket type quantities.
- Reservation has a TTL that matches or is shorter than payment expiry.
- Reservation creation occurs inside a database transaction that checks remaining capacity and increments reserved quantity atomically.
- Capacity calculations consider paid/issued tickets plus active unexpired reservations.
- Expired reservations are released by cron or opportunistically during checkout queries.
- Ticket issuance consumes the reservation and finalizes sold quantity.
- If payment expires, reservation is released.
- If a late paid webhook arrives after local expiry, the webhook handler checks whether the provider confirms actual payment. If capacity is still available, the order can be restored and tickets issued. If capacity is no longer available, the order is flagged for admin resolution/refund instead of silently issuing oversold tickets.

Request-to-book approval should also create a payment reservation or capacity hold with its own deadline. If the user does not pay by the configured deadline, the hold expires and capacity becomes available again.

### Instant Confirmation

Used for events and scheduled/open-trip tours with clear capacity.

Flow:

1. User logs in.
2. User selects listing, session, ticket type, and quantity.
3. System creates pending order/payment.
4. User pays through QRIS.
5. Payment webhook confirms paid status.
6. Tickets/vouchers are issued.
7. Email ticket/receipt is sent.
8. User can access tickets from account wallet.

### Request-to-Book

Used for private/custom tours.

Flow:

1. User logs in.
2. User submits booking request.
3. Partner reviews availability.
4. Partner approves or rejects.
5. If approved, user receives payment link/deadline.
6. Default payment deadline is 24 hours and can be configured per listing.
7. After QRIS payment is confirmed, voucher/ticket is issued.
8. Unpaid requests expire after the deadline.

## 9. Payment

Phase 1 supports QRIS payment only, through a payment abstraction. The system must not depend directly on a specific gateway in core order logic.

Internal payment provider interface normalizes provider events into:

- payment.pending
- payment.paid
- payment.expired
- payment.failed
- payment.refunded

Payment records store:

- provider
- provider reference
- method: qris
- amount
- status
- expiration timestamp
- raw webhook payload
- normalized event data
- idempotency key for payment creation
- provider event id or deterministic webhook idempotency key

QRIS default expiration for Phase 1 is 30 minutes unless the selected provider requires a different shorter window. Checkout UI shows a countdown and clear expired state. If payment expires, the user must create a new payment attempt for the same order when allowed, or restart checkout if the reservation is gone.

Payment creation must be idempotent to prevent duplicate payment attempts from double-clicks or network retries. Webhook processing must also be idempotent; repeated webhook events must not issue duplicate tickets, duplicate ledger entries, or duplicate emails.

Only confirmed payment issues tickets/vouchers.

## 10. Tickets, Vouchers, and Check-in

Default ticketing model is one QR per participant/ticket.

Each order can produce multiple `Ticket` records:

- unique code/token
- QR payload
- participant name, phone, email
- status: issued, checked_in, cancelled, refunded, void
- relation to order, order item, listing, session, and ticket type

Scanner supports mobile web usage by partner staff:

- staff logs in
- selects event/tour/session
- scans QR using phone camera
- system validates ticket in real time
- fallback manual code entry is available

Validation outcomes:

- valid
- already checked-in
- wrong listing/session
- unpaid/cancelled/refunded
- invalid ticket

Check-in records include staff actor, timestamp, ticket, listing/session context, and result.

QR payload must not expose plain ticket IDs. Phase 1 uses a signed opaque payload, such as an HMAC-signed token containing ticket code, nonce, and version. The server verifies the signature and then loads the ticket from the database. Tokens do not need to be short-lived because tickets must remain scannable offline from email/wallet screenshots, but they must be unforgeable and revocable through ticket status.

Scanner endpoints require rate limiting and must return generic errors for invalid tokens to reduce brute-force signal.

## 11. Refund and Cancellation

Phase 1 implements request and manual admin processing.

- Listing stores cancellation/refund policy text and basic rule snapshot.
- User can submit refund/cancel request.
- Admin reviews manually.
- Admin marks approved, rejected, or processed.
- Automated payment gateway refund is not required in Phase 1.
- Ledger records refund/adjustment manually.

If refund occurs before payout, it reduces the partner settlement. If after payout, it becomes a negative adjustment in a future settlement.

## 12. Finance, Commission, Ledger, and Settlement

Users pay the platform. Partners receive settlement/payout from the platform.

Every paid transaction produces ledger entries/snapshots with:

- gross amount
- platform commission
- payment fee
- discount amount if applicable in future
- refund/adjustment if applicable
- net partner amount
- partner id
- listing id
- order id
- session id
- applied fee rule snapshot
- payment reference

Ledger history should be immutable in principle. Corrections are represented through adjustment entries.

Commission rules are flexible:

1. Global default.
2. Partner override.
3. Listing override.

Fee types:

- percentage
- fixed
- combined

Fee rules are snapshotted at payment time so historical reports remain stable after rule changes.

Partner balance states are conceptual in Phase 1 and may be computed from ledger:

- pending
- available
- paid out
- adjusted

Manual payout Phase 1:

- Admin views settlement report by partner/period.
- Admin creates payout record.
- Admin records amount, transfer date, bank reference, and notes.
- Payout snapshots destination bank account.
- Admin marks payout as paid.
- Action is audited.

## 13. Promotions, Reviews, CMS, and Future Models

Promo/discount data model is prepared from the start, but checkout promo UI is Phase 2.

Promo model should support:

- promo code
- discount type
- usage limits
- scope by partner/listing/category
- active period

Review/rating model is prepared from the start, but UI is Phase 2.

Review model should support:

- eligible paid/completed/check-in ticket/order
- rating
- comment
- optional future photos
- moderation status
- partner/listing relation

CMS and support ticket models are future-facing. Phase 1 admin does not need a complete CMS or support system.

## 14. UI, Branding, and Channels

MVP channel is responsive web, PWA-friendly.

Public marketplace uses a Modern Jogja Heritage visual direction:

- warm
- local Yogyakarta cultural feel
- modern and trustworthy
- subtle batik/heritage accents
- earth, brick red, gold, cream palette with strong CTA contrast

Partner/admin dashboards use a clean SaaS style focused on tables, statuses, workflows, and operational speed, while retaining Lelampahan brand accents.

Language:

- Phase 1 UI in Bahasa Indonesia.
- Structure prepared for future English/i18n.
- Future listing translations can support title, description, itinerary, and SEO fields.

Public pages Phase 1:

- homepage focused on Yogyakarta
- listing detail page
- category/location pages
- browse/search page
- checkout page
- account order history
- ticket/voucher wallet
- receipt page/email

Partner pages Phase 1:

- onboarding
- dashboard
- listing drafts/submission
- session and ticket type management
- order/booking list
- request-to-book approval
- team/staff management
- scanner
- basic sales/check-in metrics

Admin pages Phase 1:

- approval queue
- partner/listing management
- transaction/payment monitoring
- refund request handling
- settlement report/manual payout
- basic analytics
- simple audit event viewer

Branding remains Lelampahan-first. Listings/events may show partner/event logo, organizer name, banner, and simple accent color. Full white-label or microsite is future scope.

## 15. Media Storage

Use Cloudflare R2.

- Public listing images are served through CDN/custom domain.
- Private verification documents use signed URLs.
- Database stores media metadata: bucket/key, URL strategy, MIME type, size, alt text, owner/entity relation.
- Uploads use signed upload URLs generated by server API routes after authorization checks.
- File type and file size are validated on both client and server before issuing upload permission.
- Uploaded objects are associated with an owner/entity and cannot be attached across unauthorized partners.
- Listing images may use CDN/on-demand image transformation where available to avoid storing many resized variants early.
- A future media processing worker can generate thumbnails or optimized derivatives if needed.

## 16. Notifications

Phase 1 uses Resend for transactional email. Production sending requires an authenticated custom domain with SPF, DKIM, and DMARC configured.

Ticket access must not depend only on email delivery. Users can always access issued tickets from the account wallet. Email send failures are logged and visible to admin/support workflows so the system can retry or guide the user to wallet access.

Email types:

- ticket issued and receipt
- booking request submitted
- booking request approved/payment pending
- booking rejected
- refund status
- basic partner/admin notifications

WhatsApp is future scope.

## 17. Audit Log

Audit log is designed broadly, but Phase 1 records critical events:

- partner approved/rejected
- capability approved/rejected
- listing submitted/approved/rejected/published
- price/ticket type changes after publish
- payment webhook received/normalized
- ticket issued
- check-in success/failure/already used
- refund request/admin decision
- payout marked paid/manual settlement
- bank account changed

Future audit improvements include before/after diffs, export, and suspicious activity tracking.

## 18. Analytics

Analytics is designed for growth, but Phase 1 displays basic metrics from the transactional database.

Admin metrics:

- GMV/revenue
- paid/pending/failed orders
- tickets sold
- active partners/listings
- check-ins

Partner metrics:

- gross/net revenue estimate
- orders
- tickets sold
- check-ins by event/session

Future analytics may include funnel tracking, search conversion, cohorts, recommendations, and event pipelines.

## 19. Testing Strategy

Phase 1 focuses on unit domain tests and integration tests for critical paths.

Unit/domain tests:

- pricing and commission calculation
- booking state transitions
- payment normalization
- ticket issuance
- check-in validation
- settlement ledger
- refund adjustment

Integration tests:

- instant checkout to paid webhook to ticket issued
- request-to-book to partner approval to payment to voucher issued
- scanner valid/already used/wrong listing
- refund request to admin decision
- manual payout report

Minimal E2E tests:

- public checkout happy path
- partner scanner happy path
- admin approval happy path

Manual QA remains necessary for admin/partner UI flows.

## 20. Deployment and Operations

Initial deployment:

- Vercel for Next.js.
- Supabase Auth and PostgreSQL.
- Supabase pooled database connection/PgBouncer for production Prisma access from Vercel serverless functions.
- Cloudflare R2 for media.
- Resend for email.
- Vercel Cron for lightweight expiration and cleanup.
- Sentry or equivalent for error tracking.

Operational requirements for Phase 1:

- Payment webhook handlers verify signatures and process events idempotently.
- Failed webhook processing is logged with enough context to retry safely.
- Admin can see payment/order records that require manual attention.
- Health checks or smoke checks cover app availability and critical integrations.
- Alerts should exist for repeated webhook failures, ticket issuance failures, and email delivery spikes/failures.
- Cron jobs clean expired reservations/payment attempts and should be safe to rerun.

Background jobs are kept simple in Phase 1. If job volume grows, introduce a queue or separate worker service.

## 21. Key Non-Goals for Phase 1

- Native mobile app.
- Multi-listing cart.
- Automated payout.
- Automated gateway refund.
- Full CMS.
- Active promo checkout UI.
- Review/rating UI.
- Advanced analytics pipeline.
- Public partner API.
- Full white-label/microsite.
- Elasticsearch/Meilisearch or dedicated search service.
- Recurring schedule rule engine.

## 22. Additional Data and Implementation Rules

### Slugs

Public listing slugs must be globally unique for clean SEO URLs. If a collision occurs, append a short deterministic or random suffix. Historical slug redirects can be added later if SEO requires it.

### Soft Delete

Business records such as listings, orders, tickets, payments, ledger entries, payouts, and audit logs should not be hard-deleted in normal flows. Use status fields and soft-delete/archive timestamps. Hard delete is limited to safe operational cleanup or privacy workflows that do not break financial/audit history.

### Timezone

Store all datetimes in UTC. Display marketplace and partner/admin times in Asia/Jakarta/WIB by default for Yogyakarta launch. Session creation UI should make the timezone explicit to avoid ambiguity.

### Idempotency

Create idempotency keys for payment creation, webhook handling, ticket issuance, ledger entry creation, and email sends. Retried requests must converge to the same result instead of duplicating money or tickets.

## 23. Open Implementation Decisions

These should be decided during implementation planning, not before design approval:

- Exact QRIS payment gateway adapter for first provider.
- Exact UI component library.
- Exact test runner and E2E setup.
- Exact schema naming and migration order.
