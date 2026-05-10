# Listing Images R2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add listing cover image support backed by Cloudflare R2 direct upload and a future-proof `ListingImage` schema.

**Architecture:** Add a `ListingImage` model related to `Listing`, expose a signed upload URL endpoint for direct browser-to-R2 upload, persist cover image metadata during listing creation, and render the cover image on listing cards/detail pages. The MVP supports one cover image but the schema supports galleries later.

**Tech Stack:** Next.js App Router, Prisma 7, PostgreSQL/Supabase, AWS SDK S3-compatible client for Cloudflare R2, Vitest, React Testing Library.

---

### Task 1: Add ListingImage Schema and Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_listing_images/migration.sql`

**Steps:**
1. Add `images ListingImage[]` to `Listing`.
2. Add `ListingImage` model with key/url/alt/sortOrder/isCover/mimeType/sizeBytes/width/height timestamps and cascade relation.
3. Run `npx prisma migrate dev --name add_listing_images` using `DIRECT_URL` via `prisma.config.ts`.
4. Run `npx prisma validate`.

### Task 2: Add R2 Upload Signing Library

**Files:**
- Modify: `package.json`
- Create: `src/lib/r2.ts`
- Test: `tests/lib/r2.test.ts`

**Steps:**
1. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
2. Implement image validation: jpg/jpeg/png/webp only, max 5MB.
3. Implement `createListingImageUploadTarget(input)` that validates env and returns `{ uploadUrl, key, publicUrl }`.
4. Generate keys under `listings/tmp/<uuid>-<safe-filename>`.
5. Mock SDK in tests and verify validation/env/key behavior.

### Task 3: Add Upload API Endpoint

**Files:**
- Create: `app/api/upload/listing-image/route.ts`
- Test: add API tests if existing harness supports route testing, otherwise cover lib validation and smoke through build.

**Steps:**
1. Require authenticated user via existing auth helper.
2. Ensure user has partner context via `findPartnerContextByAuthUserId`.
3. Parse body with zod: filename/contentType/sizeBytes.
4. Return signed upload target.
5. Return 401/403/400 for invalid access/input.

### Task 4: Persist Cover Image on Listing Create

**Files:**
- Modify: `src/domain/listing/schema.ts` or existing listing input schema location
- Modify: `src/data/listing.ts`
- Modify: `app/api/listing/route.ts`
- Test: `tests/data/listing-db-search.test.ts` or new `tests/data/listing-images.test.ts`

**Steps:**
1. Extend create listing input with optional `coverImage` metadata.
2. In `createListing`, create `images.create` with `isCover: true`, `sortOrder: 0`.
3. Include images in `findListingBySlug` and `listPublishedListings`.
4. Add test that listing creation persists cover image.

### Task 5: Add Cover Upload to Partner New Listing UI

**Files:**
- Modify: `app/partner/listings/new/page.tsx`

**Steps:**
1. Add file input for one image.
2. Validate client-side type/size.
3. On submit, request signed upload target, PUT file to R2, then include returned metadata as `coverImage` in listing POST.
4. Show preview and upload errors.
5. Keep image optional.

### Task 6: Render Listing Images

**Files:**
- Modify: `app/(marketplace)/page.tsx`
- Modify: `app/(marketplace)/l/[slug]/page.tsx`
- Possibly modify: `src/components/feature/listing-card.tsx`

**Steps:**
1. Map cover image URL into homepage listing cards.
2. Render cover image in listing detail hero.
3. Keep existing fallback placeholder when no image exists.

### Task 7: Environment and Verification

**Files:**
- Modify: `.env.example`
- Run verification commands.

**Steps:**
1. Add R2 env vars to `.env.example`.
2. Run `npx prisma validate`.
3. Run `npx prisma migrate status`.
4. Run `npm run typecheck`.
5. Run `npm test -- --run`.
6. Run `npm run lint`.
7. Run `npm run build`.
8. Commit and push.
