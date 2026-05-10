# Copywriting Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh Lelampahan copywriting for consistent Indonesian customer-facing language, clearer marketplace positioning, and better checkout/admin/partner microcopy.

**Architecture:** This is a UI copy-only change across Next.js App Router pages and shared components. No data model, API contract, or behavior changes are required; implementation should update static strings, labels, placeholders, status display text, and user-facing error text while preserving JSX structure.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest/ESLint/TypeScript verification.

---

### Task 1: Refresh marketplace brand, navigation, and footer copy

**Files:**
- Modify: `src/components/feature/hero-section.tsx`
- Modify: `src/components/layout/marketplace-header.tsx`
- Modify: `src/components/layout/marketplace-footer.tsx`
- Modify: `app/(marketplace)/homepage-content.tsx`
- Modify: `app/layout.tsx`

**Steps:**
1. Update hero headline to `Rasakan Jogja Lewat Pengalaman Lokal`.
2. Update hero subheadline to mention curated local experiences, online booking, QRIS.
3. Update search placeholder to local examples.
4. Replace `Home` with `Beranda` in header/footer.
5. Replace generic footer positioning with clearer local marketplace description.
6. Replace marketplace metadata descriptions with stronger local experience copy.
7. Run `npm run typecheck` and `npm run lint`.

### Task 2: Refresh public listing detail and customer account copy

**Files:**
- Modify: `app/(marketplace)/l/[slug]/page.tsx`
- Modify: `src/components/feature/session-picker.tsx`
- Modify: `src/components/feature/listing-card.tsx`
- Modify: `src/components/layout/account-shell.tsx`
- Modify: `app/account/orders/page.tsx`
- Modify: `app/account/tickets/page.tsx`

**Steps:**
1. Replace customer-facing `Listing` terms with `Pengalaman` where natural.
2. Replace `Wallet Tiket` with `Tiket Saya`.
3. Improve empty states for orders and tickets.
4. Improve section headings: `Tentang Pengalaman Ini`, `Rencana Perjalanan`, `Informasi Kedatangan`, `Pilih Jadwal`.
5. Improve sold-out status text to `Kuota penuh`.
6. Run `npm run typecheck` and `npm run lint`.

### Task 3: Refresh auth and checkout microcopy

**Files:**
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/register/page.tsx`
- Modify: `app/checkout/checkout-client.tsx`
- Modify: `src/components/feature/checkout-summary.tsx`
- Modify: `app/checkout/error/page.tsx`
- Modify: `app/checkout/pending/page.tsx`

**Steps:**
1. Replace `Login` with `Masuk` in user-facing copy.
2. Replace `Password` labels with `Kata sandi` where displayed.
3. Map common Supabase auth errors to Indonesian copy.
4. Replace technical checkout errors with user-friendly guidance.
5. Remove `webhook` from pending payment copy.
6. Add QRIS/payment reassurance copy.
7. Run `npm run typecheck` and `npm run lint`.

### Task 4: Refresh partner and admin operational copy

**Files:**
- Modify: `src/components/layout/partner-shell.tsx`
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `src/components/layout/sidebar-navigation.tsx`
- Modify: `app/partner/page.tsx`
- Modify: `app/partner/listings/page.tsx`
- Modify: `app/partner/listings/new/page.tsx`
- Modify: `app/partner/listings/[id]/page.tsx`
- Modify: `app/partner/listings/[id]/sessions/page.tsx`
- Modify: `app/partner/bookings/page.tsx`
- Modify: `app/partner/scanner/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/listings/page.tsx`
- Modify: `app/admin/partners/page.tsx`

**Steps:**
1. Replace `Listings` with `Pengalaman` in navigation/headings where displayed.
2. Replace `Approve/Reject` with `Setujui/Tolak` in admin and partner workflows.
3. Replace admin labels: `Revenue` → `Pendapatan`, `Pending Review` → `Menunggu Review`.
4. Replace partner labels: `Partner Portal` → `Portal Partner`, `Scan Tiket` → `Pindai Tiket`, `Scanner Tiket` → `Pemindai Tiket`.
5. Improve listing creation form labels and helper text.
6. Run `npm run typecheck` and `npm run lint`.

### Task 5: Polish seed listing copy and final verification

**Files:**
- Modify: `prisma/seed.ts`

**Steps:**
1. Improve seed listing descriptions for Kotagede and Batik while keeping facts safe.
2. Run final verification:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
3. Review diff with `git diff --stat` and `git diff --check`.
