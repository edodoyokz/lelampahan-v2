# Full Role Portal UI Design

**Goal:** Complete the frontend portal experience for all roles: customer, partner, admin, and super admin.

**Scope:** Frontend/UI-focused. Use existing API/data where available. Use clear placeholder UI for product areas whose backend is not implemented yet. Avoid large backend changes.

---

## Approach

Use a role portal UI completion approach:

1. Polish existing pages and shells.
2. Add lightweight detail/placeholder routes where needed.
3. Add shared UI primitives for consistency.
4. Keep customer-facing and role-facing copy in Indonesian.
5. Preserve current auth and route protection model.

This avoids overbuilding backend systems while making every demo account feel like it has a complete portal.

---

## Customer Portal

### Routes

Existing:

- `/account`
- `/account/orders`
- `/account/tickets`

Potential additions:

- `/account/orders/[id]` if order data shape supports detail view.
- `/account/tickets/[code]` if ticket data shape supports detail view.

If detail routes are too risky for current APIs, use richer cards and visible CTAs without adding unsupported navigation.

### UI

`/account` becomes a customer dashboard rather than a profile-only page.

Sections:

- Greeting: “Halo, Citra”.
- Summary cards:
  - Total pesanan.
  - Tiket aktif.
  - Menunggu pembayaran.
- Quick actions:
  - Jelajahi Pengalaman.
  - Lihat Tiket Saya.
  - Riwayat Pesanan.
- Profile card:
  - Name.
  - Email.
  - Note about auth-managed profile data.

`/account/orders` improvements:

- Indonesian status labels.
- Better order cards/table.
- Empty/loading/error states.
- CTA to continue exploration or check tickets.

`/account/tickets` improvements:

- More visual ticket cards.
- QR/code presentation area.
- Session and listing details.
- Check-in guidance copy.

---

## Partner Portal

### Routes

Existing:

- `/partner`
- `/partner/listings`
- `/partner/listings/new`
- `/partner/listings/[id]`
- `/partner/listings/[id]/sessions`
- `/partner/bookings`
- `/partner/scanner`

### UI

`/partner` dashboard:

- Partner status banner.
- Stat cards:
  - Pengalaman aktif.
  - Draft/menunggu review.
  - Pesanan bulan ini.
  - Estimasi pendapatan, with placeholder note if data not real.
- Quick action cards:
  - Buat Pengalaman.
  - Kelola Pengalaman.
  - Lihat Pesanan.
  - Pindai Tiket.

`/partner/listings`:

- Status filter tabs:
  - Semua.
  - Draft.
  - Review.
  - Terbit.
  - Ditolak.
- Clearer empty states per filter.
- Consistent Indonesian labels.

`/partner/bookings`:

- Summary bar:
  - Permintaan.
  - Menunggu Pembayaran.
  - Disetujui/Selesai.
- Better mobile cards.
- Detail context inside confirmation modal.

`/partner/scanner`:

- Production-like scanner layout.
- Camera panel.
- Manual ticket code validation.
- Clear demo note while validation remains simulated.
- Success/error result cards with next-action buttons.

---

## Admin Portal

### Routes

Existing:

- `/admin`
- `/admin/partners`
- `/admin/listings`

### UI

`/admin` dashboard:

- Stat cards:
  - Partner menunggu review.
  - Pengalaman menunggu review.
  - Total partner.
  - Total pengalaman.
  - Pendapatan placeholder.
- Review queue cards:
  - Partner review.
  - Pengalaman review.
- Operational notes for features not yet connected to backend.

`/admin/partners`:

- Status filter tabs.
- Review-focused list.
- Better mobile card details.
- Approve/reject modal with clearer copy.

`/admin/listings`:

- Status filter tabs.
- Review-focused list.
- Better mobile card details.
- Approve/reject modal with clearer copy.

---

## Super Admin UI

Super Admin currently shares `/admin` access. Add visible frontend differentiation without implementing complex backend permissions.

### Shell changes

If current role is `SUPER_ADMIN`:

- Show badge “Super Admin”.
- Show extra nav items:
  - Pengguna.
  - Audit.
  - Pengaturan.

If current role is `ADMIN`, hide these extra items.

### Placeholder routes

- `/admin/users`
- `/admin/audit`
- `/admin/settings`

Each page should:

- Render a polished placeholder state.
- Explain this is a Super Admin area.
- Show what will be managed there.

Route protection may remain admin-level in middleware, but UI menu visibility should distinguish super admin. If lightweight server role guard is easy, add it; otherwise keep placeholder content safe and non-destructive.

---

## Shared UI Components

Add reusable components:

- `PageHeader`
- `StatCard`
- `QuickActionCard`
- `RoleBadge`
- `StatusFilterTabs`
- Optional `InfoBanner`

These components should be simple, typed, testable, and based on existing Tailwind/design tokens.

---

## Error, Empty, Loading States

Use consistent patterns:

- Loading: skeleton cards/tables.
- Empty: `EmptyState` with a specific next action.
- Error: red/amber alert box with recovery hint.
- Placeholder: neutral card with “akan datang” wording.

---

## Testing

Use Vitest and Testing Library.

Test focus:

- Shared UI components render correctly.
- Shells show role-aware navigation.
- Customer dashboard renders profile and dashboard CTAs.
- Partner dashboard/listing filters/bookings summaries render.
- Admin dashboard and status filters render.
- Super Admin placeholder routes render and regular admin nav hides those menu items.

---

## Out of Scope

- Real revenue computation.
- Settlement/payout/refund backend.
- Real QR scan decoding.
- User management backend.
- Audit log backend.
- Complex permission matrix beyond current roles.
