# Remove Emoji and Use Modern React Icons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all emoji from the application UI and replace them with professional React icons.

**Architecture:** Use `lucide-react` as the icon library. Replace emoji strings and status symbols in app/components with accessible icon components or plain professional copy. Update tests that previously asserted emoji output.

**Tech Stack:** Next.js App Router, React, lucide-react, Vitest, React Testing Library.

---

### Task 1: Add lucide-react

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Steps:**
1. Run `npm install lucide-react`.
2. Verify package lock updates.

### Task 2: Replace Marketplace Category Emoji

**Files:**
- Modify: `app/(marketplace)/homepage-content.tsx`
- Modify tests: `tests/components/feature/category-browser.test.tsx`

**Steps:**
1. Replace category `icon` emoji strings with lucide icon components or icon keys.
2. Replace search empty state emoji with `Search` icon.
3. Update tests to assert labels/accessibility instead of emoji text.

### Task 3: Replace Account Ticket Empty State Emoji

**Files:**
- Modify: `app/account/tickets/page.tsx`

**Steps:**
1. Import `Ticket` icon from `lucide-react`.
2. Replace the ticket emoji span with a styled icon component.

### Task 4: Replace Partner Listing Form Emoji and Symbols

**Files:**
- Modify: `app/partner/listings/new/page.tsx`

**Steps:**
1. Import appropriate icons from `lucide-react`.
2. Replace Tour/Event/Instant/Request emojis with icons.
3. Replace success text containing check emoji with professional text.
4. Replace remove/close symbol with `X` icon or text.
5. Replace status logic based on success symbols with boolean success state or message comparison.

### Task 5: Replace Session Page Success Emoji

**Files:**
- Modify: `app/partner/listings/[id]/sessions/page.tsx`

**Steps:**
1. Replace success message containing check emoji.
2. Replace status style logic based on check emoji with explicit success/error state.

### Task 6: Replace Toast Symbols

**Files:**
- Modify: `src/components/ui/toast.tsx`

**Steps:**
1. Replace textual status symbols with lucide `CheckCircle`, `AlertCircle`, and `X` icons.
2. Preserve accessibility labels.

### Task 7: Scan and Verify

**Steps:**
1. Run a Unicode emoji/symbol scan over `app`, `src`, and `tests`.
2. Run `npm run typecheck`.
3. Run `npm test -- --run`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Commit and push.
