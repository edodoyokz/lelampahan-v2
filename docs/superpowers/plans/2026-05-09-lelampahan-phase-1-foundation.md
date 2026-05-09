# Lelampahan Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial Lelampahan codebase foundation with Next.js, Prisma/PostgreSQL, Supabase Auth integration points, core domain state machines, payment idempotency primitives, reservation concurrency primitives, signed ticket tokens, and baseline quality tooling.

**Architecture:** Start with a modular monolith in one Next.js app. Keep UI routes, domain services, database schema, and integration adapters separated so later plans can add public marketplace, partner portal, admin backoffice, checkout UI, and scanner UI without rewriting core logic.

**Tech Stack:** Next.js, TypeScript, PostgreSQL/Supabase, Prisma, Vitest, Zod, Tailwind CSS, ESLint, Prettier, Sentry-compatible error boundary hooks, Node crypto HMAC.

---

## Scope

This plan implements the foundation only. The approved design is intentionally broad, so Phase 1 should be delivered through multiple implementation plans:

1. Foundation and core domain primitives: this plan.
2. Public marketplace and listing management.
3. Partner portal and team/scanner workflows.
4. Admin backoffice approval, finance, settlement, and refunds.
5. Payment provider adapter, checkout UI, and email delivery.
6. Production hardening, monitoring, and deployment.

This plan must leave the repository in a working, tested state with core domain functions ready for the next plan.

## File Structure

Create these main areas:

```text
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/health/route.ts
├── src/
│   ├── config/env.ts
│   ├── db/prisma.ts
│   ├── domain/
│   │   ├── booking/state-machine.ts
│   │   ├── booking/reservation-policy.ts
│   │   ├── payment/idempotency.ts
│   │   ├── payment/state-machine.ts
│   │   ├── ticket/token.ts
│   │   └── shared/errors.ts
│   └── test/factories.ts
├── prisma/
│   └── schema.prisma
├── tests/
│   └── domain/
│       ├── booking-state-machine.test.ts
│       ├── payment-idempotency.test.ts
│       ├── payment-state-machine.test.ts
│       ├── reservation-policy.test.ts
│       └── ticket-token.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── README.md
```

## Task 1: Initialize Next.js and Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `README.md`

- [ ] **Step 1: Create package manifest**

Write `package.json`:

```json
{
  "name": "lelampahan-v2",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "latest",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "autoprefixer": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "jsdom": "latest",
    "postcss": "latest",
    "prettier": "latest",
    "prisma": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create test config**

Write `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 4: Create gitignore and environment example**

Write `.gitignore`:

```gitignore
node_modules
.next
.vercel
.env
.env.local
.env.*.local
coverage
.DS_Store
.superpowers
```

Write `.env.example`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lelampahan?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/lelampahan?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="replace-with-anon-key"
SUPABASE_SERVICE_ROLE_KEY="replace-with-service-role-key"
TICKET_TOKEN_SECRET="replace-with-32-byte-random-secret"
APP_BASE_URL="http://localhost:3000"
```

- [ ] **Step 5: Create Tailwind files**

Write `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Write `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lelampahan: {
          cream: '#FFF7ED',
          gold: '#D97706',
          brick: '#B45309',
          earth: '#431407',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create initial app shell**

Write `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  margin: 0;
  background: #fff7ed;
  color: #431407;
}
```

Write `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lelampahan',
  description: 'Marketplace tour, paket perjalanan, dan event Yogyakarta.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

Write `app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lelampahan-brick">
        Yogyakarta-first marketplace
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-lelampahan-earth">
        Lelampahan
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-amber-950/80">
        Platform untuk tour, paket perjalanan, event, tiket QR, dan operasional partner.
      </p>
    </main>
  );
}
```

Write `README.md`:

```md
# Lelampahan v2

Lelampahan is a Yogyakarta-first marketplace for tours, travel packages, and events.

## Development

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Run tests with `npm test`.
5. Start development server with `npm run dev`.
```

- [ ] **Step 7: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 8: Run typecheck and tests**

Run:

```bash
npm run typecheck
npm test
```

Expected: typecheck passes. Tests pass with no test files or with zero discovered tests depending on Vitest version.

- [ ] **Step 9: Commit**

Run:

```bash
git add .
git commit -m "chore: initialize lelampahan app foundation"
```

Expected: commit succeeds. If the workspace is not a git repository, initialize only after confirming with the project owner.

## Task 2: Environment and Shared Errors

**Files:**
- Create: `src/config/env.ts`
- Create: `src/domain/shared/errors.ts`
- Test: `tests/domain/env-and-errors.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/domain/env-and-errors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { DomainError } from '@/domain/shared/errors';

const ORIGINAL_ENV = process.env;

describe('DomainError', () => {
  it('stores a stable code and message', () => {
    const error = new DomainError('INVALID_TRANSITION', 'Invalid order transition');

    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('INVALID_TRANSITION');
    expect(error.message).toBe('Invalid order transition');
  });
});

describe('env module', () => {
  it('throws a readable error when required variables are missing', async () => {
    vi.resetModules();
    process.env = {};

    await expect(import('@/config/env')).rejects.toThrow('Missing required environment variable');

    process.env = ORIGINAL_ENV;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/domain/env-and-errors.test.ts
```

Expected: FAIL because `src/config/env.ts` and `src/domain/shared/errors.ts` do not exist.

- [ ] **Step 3: Implement shared error type**

Write `src/domain/shared/errors.ts`:

```ts
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
```

- [ ] **Step 4: Implement environment parser**

Write `src/config/env.ts`:

```ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TICKET_TOKEN_SECRET: z.string().min(16),
  APP_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const firstIssue = parsed.error.issues[0];
  const key = firstIssue?.path.join('.') || 'unknown';
  throw new Error(`Missing required environment variable: ${key}`);
}

export const env = parsed.data;
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm test -- tests/domain/env-and-errors.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/config/env.ts src/domain/shared/errors.ts tests/domain/env-and-errors.test.ts
git commit -m "chore: add environment validation and domain errors"
```

## Task 3: Prisma Schema Foundation

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/db/prisma.ts`

- [ ] **Step 1: Create Prisma schema with core models**

Write `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

enum PartnerCapabilityType {
  TOURS
  EVENTS
}

enum ReviewStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  PUBLISHED
  ARCHIVED
}

enum ListingType {
  TOUR
  EVENT
}

enum BookingMode {
  INSTANT_CONFIRMATION
  REQUEST_TO_BOOK
}

enum OrderStatus {
  DRAFT
  PENDING_PAYMENT
  PAID
  COMPLETED
  EXPIRED
  CANCELLED
  REFUND_REQUESTED
  REFUND_REJECTED
  PARTIALLY_REFUNDED
  REFUNDED
  NEEDS_ADMIN_REVIEW
}

enum BookingRequestStatus {
  REQUESTED
  PARTNER_APPROVED
  PARTNER_REJECTED
  PENDING_PAYMENT
  PAID
  COMPLETED
  EXPIRED
  PAYMENT_EXPIRED
  REFUND_REQUESTED
}

enum PaymentStatus {
  PENDING
  PAID
  EXPIRED
  FAILED
  REFUNDED
}

enum TicketStatus {
  ISSUED
  CHECKED_IN
  CANCELLED
  REFUNDED
  VOID
}

enum ReservationStatus {
  ACTIVE
  CONSUMED
  EXPIRED
  RELEASED
}

enum CheckInResult {
  VALID
  ALREADY_CHECKED_IN
  WRONG_SCOPE
  NOT_PAYABLE
  INVALID_TICKET
}

model UserProfile {
  id        String   @id @default(cuid())
  authUserId String  @unique
  email     String   @unique
  name      String?
  phone     String?
  role      UserRole @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships PartnerMembership[]
  orders      Order[]
}

model Partner {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  status      ReviewStatus @default(PENDING_REVIEW)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  archivedAt  DateTime?

  capabilities PartnerCapability[]
  memberships  PartnerMembership[]
  listings     Listing[]
  bankAccounts BankAccount[]
}

model PartnerCapability {
  id        String @id @default(cuid())
  partnerId String
  type      PartnerCapabilityType
  status    ReviewStatus @default(PENDING_REVIEW)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  partner Partner @relation(fields: [partnerId], references: [id])

  @@unique([partnerId, type])
}

model PartnerMembership {
  id        String @id @default(cuid())
  partnerId String
  userId    String
  role      String
  createdAt DateTime @default(now())

  partner Partner @relation(fields: [partnerId], references: [id])
  user    UserProfile @relation(fields: [userId], references: [id])

  @@unique([partnerId, userId])
}

model BankAccount {
  id              String @id @default(cuid())
  partnerId       String
  bankName        String
  accountNumber   String
  accountHolder   String
  activeForPayout Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  archivedAt      DateTime?

  partner Partner @relation(fields: [partnerId], references: [id])
}

model Listing {
  id          String @id @default(cuid())
  partnerId   String
  type        ListingType
  title       String
  slug        String @unique
  description String
  status      ReviewStatus @default(DRAFT)
  bookingMode BookingMode
  timezone    String @default("Asia/Jakarta")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  archivedAt  DateTime?

  partner     Partner @relation(fields: [partnerId], references: [id])
  tourDetail  TourDetail?
  eventDetail EventDetail?
  sessions    Session[]
}

model TourDetail {
  id          String @id @default(cuid())
  listingId   String @unique
  duration    String?
  itinerary   Json?
  included    Json?
  excluded    Json?

  listing Listing @relation(fields: [listingId], references: [id])
}

model EventDetail {
  id        String @id @default(cuid())
  listingId String @unique
  venue     String?
  gateNotes String?

  listing Listing @relation(fields: [listingId], references: [id])
}

model Session {
  id            String @id @default(cuid())
  listingId     String
  startsAt      DateTime
  endsAt        DateTime
  capacity      Int
  bookingCutoff DateTime
  status        ReviewStatus @default(PUBLISHED)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  listing      Listing @relation(fields: [listingId], references: [id])
  ticketTypes  TicketType[]
  reservations Reservation[]
  orders       Order[]
}

model TicketType {
  id        String @id @default(cuid())
  sessionId String
  name      String
  price     Int
  quota     Int?
  active    Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session      Session @relation(fields: [sessionId], references: [id])
  reservations Reservation[]
  orderItems   OrderItem[]
}

model Reservation {
  id           String @id @default(cuid())
  sessionId    String
  ticketTypeId String
  quantity     Int
  status       ReservationStatus @default(ACTIVE)
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  session    Session @relation(fields: [sessionId], references: [id])
  ticketType TicketType @relation(fields: [ticketTypeId], references: [id])
  order      Order?
}

model Order {
  id            String @id @default(cuid())
  orderNumber   String @unique
  userId        String
  sessionId     String
  reservationId String? @unique
  status        OrderStatus @default(DRAFT)
  totalAmount   Int
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user        UserProfile @relation(fields: [userId], references: [id])
  session     Session @relation(fields: [sessionId], references: [id])
  reservation Reservation? @relation(fields: [reservationId], references: [id])
  items       OrderItem[]
  payment     Payment?
  tickets     Ticket[]
}

model OrderItem {
  id           String @id @default(cuid())
  orderId      String
  ticketTypeId String
  quantity     Int
  unitPrice    Int
  subtotal     Int

  order      Order @relation(fields: [orderId], references: [id])
  ticketType TicketType @relation(fields: [ticketTypeId], references: [id])
}

model Payment {
  id              String @id @default(cuid())
  orderId         String @unique
  provider        String
  providerRef     String?
  method          String
  amount          Int
  status          PaymentStatus @default(PENDING)
  idempotencyKey  String @unique
  providerEventId String? @unique
  rawPayload      Json?
  expiresAt       DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  order Order @relation(fields: [orderId], references: [id])
}

model Ticket {
  id          String @id @default(cuid())
  orderId     String
  code        String @unique
  participantName  String
  participantEmail String
  participantPhone String
  status      TicketStatus @default(ISSUED)
  checkedInAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  order    Order @relation(fields: [orderId], references: [id])
  checkIns CheckIn[]
}

model CheckIn {
  id        String @id @default(cuid())
  ticketId  String
  staffId   String
  result    CheckInResult
  createdAt DateTime @default(now())

  ticket Ticket @relation(fields: [ticketId], references: [id])
}
```

- [ ] **Step 2: Create Prisma client singleton**

Write `src/db/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Format and generate Prisma client**

Run:

```bash
npx prisma format
npm run prisma:generate
```

Expected: Prisma schema formats successfully and Prisma Client is generated.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add prisma/schema.prisma src/db/prisma.ts package.json package-lock.json
git commit -m "feat: add prisma schema foundation"
```

## Task 4: Booking State Machine

**Files:**
- Create: `src/domain/booking/state-machine.ts`
- Test: `tests/domain/booking-state-machine.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/domain/booking-state-machine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  assertBookingRequestTransition,
  assertOrderTransition,
  canTransitionBookingRequest,
  canTransitionOrder,
} from '@/domain/booking/state-machine';

describe('order state machine', () => {
  it('allows instant checkout to move from draft to pending payment to paid', () => {
    expect(canTransitionOrder('DRAFT', 'PENDING_PAYMENT')).toBe(true);
    expect(canTransitionOrder('PENDING_PAYMENT', 'PAID')).toBe(true);
  });

  it('allows pending payment to expire or cancel', () => {
    expect(canTransitionOrder('PENDING_PAYMENT', 'EXPIRED')).toBe(true);
    expect(canTransitionOrder('PENDING_PAYMENT', 'CANCELLED')).toBe(true);
  });

  it('rejects invalid order transitions', () => {
    expect(canTransitionOrder('EXPIRED', 'PAID')).toBe(false);
    expect(() => assertOrderTransition('EXPIRED', 'PAID')).toThrow('Invalid order transition');
  });

  it('allows paid orders to enter refund flow', () => {
    expect(canTransitionOrder('PAID', 'REFUND_REQUESTED')).toBe(true);
    expect(canTransitionOrder('REFUND_REQUESTED', 'REFUNDED')).toBe(true);
    expect(canTransitionOrder('REFUND_REQUESTED', 'REFUND_REJECTED')).toBe(true);
  });
});

describe('booking request state machine', () => {
  it('allows request-to-book approval and payment', () => {
    expect(canTransitionBookingRequest('REQUESTED', 'PARTNER_APPROVED')).toBe(true);
    expect(canTransitionBookingRequest('PARTNER_APPROVED', 'PENDING_PAYMENT')).toBe(true);
    expect(canTransitionBookingRequest('PENDING_PAYMENT', 'PAID')).toBe(true);
  });

  it('allows partner rejection and expiry', () => {
    expect(canTransitionBookingRequest('REQUESTED', 'PARTNER_REJECTED')).toBe(true);
    expect(canTransitionBookingRequest('PARTNER_APPROVED', 'EXPIRED')).toBe(true);
    expect(canTransitionBookingRequest('PENDING_PAYMENT', 'PAYMENT_EXPIRED')).toBe(true);
  });

  it('rejects invalid request transitions', () => {
    expect(canTransitionBookingRequest('PARTNER_REJECTED', 'PAID')).toBe(false);
    expect(() => assertBookingRequestTransition('PARTNER_REJECTED', 'PAID')).toThrow(
      'Invalid booking request transition',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/domain/booking-state-machine.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement booking state machine**

Write `src/domain/booking/state-machine.ts`:

```ts
import { DomainError } from '@/domain/shared/errors';

export type OrderState =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_REJECTED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'NEEDS_ADMIN_REVIEW';

export type BookingRequestState =
  | 'REQUESTED'
  | 'PARTNER_APPROVED'
  | 'PARTNER_REJECTED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'PAYMENT_EXPIRED'
  | 'REFUND_REQUESTED';

const orderTransitions: Record<OrderState, OrderState[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAID', 'EXPIRED', 'CANCELLED', 'NEEDS_ADMIN_REVIEW'],
  PAID: ['COMPLETED', 'REFUND_REQUESTED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
  COMPLETED: ['REFUND_REQUESTED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
  EXPIRED: ['NEEDS_ADMIN_REVIEW'],
  CANCELLED: [],
  REFUND_REQUESTED: ['REFUNDED', 'REFUND_REJECTED', 'PARTIALLY_REFUNDED'],
  REFUND_REJECTED: ['COMPLETED'],
  PARTIALLY_REFUNDED: ['COMPLETED', 'REFUND_REQUESTED', 'REFUNDED'],
  REFUNDED: [],
  NEEDS_ADMIN_REVIEW: ['PAID', 'REFUNDED', 'CANCELLED'],
};

const bookingRequestTransitions: Record<BookingRequestState, BookingRequestState[]> = {
  REQUESTED: ['PARTNER_APPROVED', 'PARTNER_REJECTED', 'EXPIRED'],
  PARTNER_APPROVED: ['PENDING_PAYMENT', 'EXPIRED'],
  PARTNER_REJECTED: [],
  PENDING_PAYMENT: ['PAID', 'PAYMENT_EXPIRED'],
  PAID: ['COMPLETED', 'REFUND_REQUESTED'],
  COMPLETED: ['REFUND_REQUESTED'],
  EXPIRED: [],
  PAYMENT_EXPIRED: ['EXPIRED'],
  REFUND_REQUESTED: ['COMPLETED'],
};

export function canTransitionOrder(from: OrderState, to: OrderState): boolean {
  return orderTransitions[from].includes(to);
}

export function assertOrderTransition(from: OrderState, to: OrderState): void {
  if (!canTransitionOrder(from, to)) {
    throw new DomainError('INVALID_ORDER_TRANSITION', `Invalid order transition: ${from} -> ${to}`, {
      from,
      to,
    });
  }
}

export function canTransitionBookingRequest(
  from: BookingRequestState,
  to: BookingRequestState,
): boolean {
  return bookingRequestTransitions[from].includes(to);
}

export function assertBookingRequestTransition(
  from: BookingRequestState,
  to: BookingRequestState,
): void {
  if (!canTransitionBookingRequest(from, to)) {
    throw new DomainError(
      'INVALID_BOOKING_REQUEST_TRANSITION',
      `Invalid booking request transition: ${from} -> ${to}`,
      { from, to },
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/domain/booking-state-machine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/booking/state-machine.ts tests/domain/booking-state-machine.test.ts
git commit -m "feat: add booking state machines"
```

## Task 5: Payment State Machine and Idempotency

**Files:**
- Create: `src/domain/payment/state-machine.ts`
- Create: `src/domain/payment/idempotency.ts`
- Test: `tests/domain/payment-state-machine.test.ts`
- Test: `tests/domain/payment-idempotency.test.ts`

- [ ] **Step 1: Write failing payment state tests**

Write `tests/domain/payment-state-machine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { assertPaymentTransition, canTransitionPayment } from '@/domain/payment/state-machine';

describe('payment state machine', () => {
  it('allows pending payment to become paid, expired, or failed', () => {
    expect(canTransitionPayment('PENDING', 'PAID')).toBe(true);
    expect(canTransitionPayment('PENDING', 'EXPIRED')).toBe(true);
    expect(canTransitionPayment('PENDING', 'FAILED')).toBe(true);
  });

  it('allows paid payment to become refunded', () => {
    expect(canTransitionPayment('PAID', 'REFUNDED')).toBe(true);
  });

  it('rejects expired payment becoming paid through normal transition', () => {
    expect(canTransitionPayment('EXPIRED', 'PAID')).toBe(false);
    expect(() => assertPaymentTransition('EXPIRED', 'PAID')).toThrow('Invalid payment transition');
  });
});
```

- [ ] **Step 2: Write failing idempotency tests**

Write `tests/domain/payment-idempotency.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  createPaymentIdempotencyKey,
  createWebhookIdempotencyKey,
} from '@/domain/payment/idempotency';

describe('payment idempotency', () => {
  it('creates stable payment creation keys from user and order', () => {
    const first = createPaymentIdempotencyKey({ orderId: 'order_1', userId: 'user_1', attempt: 1 });
    const second = createPaymentIdempotencyKey({ orderId: 'order_1', userId: 'user_1', attempt: 1 });

    expect(first).toBe(second);
    expect(first).toBe('payment:create:user_1:order_1:1');
  });

  it('creates stable webhook keys from provider and event id', () => {
    expect(createWebhookIdempotencyKey({ provider: 'midtrans', eventId: 'evt_123' })).toBe(
      'payment:webhook:midtrans:evt_123',
    );
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- tests/domain/payment-state-machine.test.ts tests/domain/payment-idempotency.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 4: Implement payment state machine**

Write `src/domain/payment/state-machine.ts`:

```ts
import { DomainError } from '@/domain/shared/errors';

export type PaymentState = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';

const paymentTransitions: Record<PaymentState, PaymentState[]> = {
  PENDING: ['PAID', 'EXPIRED', 'FAILED'],
  PAID: ['REFUNDED'],
  EXPIRED: [],
  FAILED: [],
  REFUNDED: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return paymentTransitions[from].includes(to);
}

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!canTransitionPayment(from, to)) {
    throw new DomainError('INVALID_PAYMENT_TRANSITION', `Invalid payment transition: ${from} -> ${to}`, {
      from,
      to,
    });
  }
}
```

- [ ] **Step 5: Implement idempotency helpers**

Write `src/domain/payment/idempotency.ts`:

```ts
export function createPaymentIdempotencyKey(input: {
  userId: string;
  orderId: string;
  attempt: number;
}): string {
  return `payment:create:${input.userId}:${input.orderId}:${input.attempt}`;
}

export function createWebhookIdempotencyKey(input: { provider: string; eventId: string }): string {
  return `payment:webhook:${input.provider}:${input.eventId}`;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
npm test -- tests/domain/payment-state-machine.test.ts tests/domain/payment-idempotency.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/payment tests/domain/payment-state-machine.test.ts tests/domain/payment-idempotency.test.ts
git commit -m "feat: add payment state and idempotency primitives"
```

## Task 6: Reservation Policy

**Files:**
- Create: `src/domain/booking/reservation-policy.ts`
- Test: `tests/domain/reservation-policy.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/domain/reservation-policy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  calculateAvailableCapacity,
  createReservationExpiry,
  ensureCapacityAvailable,
} from '@/domain/booking/reservation-policy';

describe('reservation policy', () => {
  it('uses 30 minutes as default reservation expiry', () => {
    const now = new Date('2026-05-09T10:00:00.000Z');
    expect(createReservationExpiry(now).toISOString()).toBe('2026-05-09T10:30:00.000Z');
  });

  it('calculates capacity after sold and active reservations', () => {
    expect(
      calculateAvailableCapacity({
        capacity: 10,
        soldQuantity: 4,
        activeReservedQuantity: 3,
      }),
    ).toBe(3);
  });

  it('does not return negative availability', () => {
    expect(
      calculateAvailableCapacity({
        capacity: 5,
        soldQuantity: 4,
        activeReservedQuantity: 4,
      }),
    ).toBe(0);
  });

  it('allows reservation when requested quantity fits', () => {
    expect(() =>
      ensureCapacityAvailable({ capacity: 10, soldQuantity: 4, activeReservedQuantity: 3, requestedQuantity: 3 }),
    ).not.toThrow();
  });

  it('rejects reservation when requested quantity exceeds available capacity', () => {
    expect(() =>
      ensureCapacityAvailable({ capacity: 10, soldQuantity: 4, activeReservedQuantity: 3, requestedQuantity: 4 }),
    ).toThrow('Not enough capacity available');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/domain/reservation-policy.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement reservation policy**

Write `src/domain/booking/reservation-policy.ts`:

```ts
import { DomainError } from '@/domain/shared/errors';

export const DEFAULT_RESERVATION_TTL_MINUTES = 30;

export function createReservationExpiry(
  now: Date,
  ttlMinutes: number = DEFAULT_RESERVATION_TTL_MINUTES,
): Date {
  return new Date(now.getTime() + ttlMinutes * 60 * 1000);
}

export function calculateAvailableCapacity(input: {
  capacity: number;
  soldQuantity: number;
  activeReservedQuantity: number;
}): number {
  return Math.max(0, input.capacity - input.soldQuantity - input.activeReservedQuantity);
}

export function ensureCapacityAvailable(input: {
  capacity: number;
  soldQuantity: number;
  activeReservedQuantity: number;
  requestedQuantity: number;
}): void {
  const available = calculateAvailableCapacity(input);

  if (input.requestedQuantity < 1) {
    throw new DomainError('INVALID_RESERVATION_QUANTITY', 'Reservation quantity must be at least 1');
  }

  if (input.requestedQuantity > available) {
    throw new DomainError('INSUFFICIENT_CAPACITY', 'Not enough capacity available', {
      available,
      requestedQuantity: input.requestedQuantity,
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/domain/reservation-policy.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/booking/reservation-policy.ts tests/domain/reservation-policy.test.ts
git commit -m "feat: add reservation capacity policy"
```

## Task 7: Signed Ticket Token

**Files:**
- Create: `src/domain/ticket/token.ts`
- Test: `tests/domain/ticket-token.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/domain/ticket-token.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createTicketToken, verifyTicketToken } from '@/domain/ticket/token';

describe('ticket token', () => {
  it('creates and verifies an HMAC signed token', () => {
    const token = createTicketToken({ ticketCode: 'TICKET-123', nonce: 'nonce-1' }, 'secret-key');

    expect(token).toContain('v1.');
    expect(verifyTicketToken(token, 'secret-key')).toEqual({
      version: 'v1',
      ticketCode: 'TICKET-123',
      nonce: 'nonce-1',
    });
  });

  it('rejects tokens signed with another secret', () => {
    const token = createTicketToken({ ticketCode: 'TICKET-123', nonce: 'nonce-1' }, 'secret-key');

    expect(() => verifyTicketToken(token, 'wrong-secret')).toThrow('Invalid ticket token signature');
  });

  it('rejects malformed tokens', () => {
    expect(() => verifyTicketToken('not-a-token', 'secret-key')).toThrow('Malformed ticket token');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/domain/ticket-token.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement ticket token functions**

Write `src/domain/ticket/token.ts`:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { DomainError } from '@/domain/shared/errors';

const TOKEN_VERSION = 'v1';

type TicketTokenPayload = {
  ticketCode: string;
  nonce: string;
};

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function unbase64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createTicketToken(payload: TicketTokenPayload, secret: string): string {
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${TOKEN_VERSION}.${encodedPayload}`;
  const signature = sign(data, secret);

  return `${data}.${signature}`;
}

export function verifyTicketToken(
  token: string,
  secret: string,
): { version: 'v1'; ticketCode: string; nonce: string } {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  const [version, encodedPayload, signature] = parts;

  if (version !== TOKEN_VERSION || !encodedPayload || !signature) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  const data = `${version}.${encodedPayload}`;
  const expectedSignature = sign(data, secret);
  const signatureBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new DomainError('INVALID_TICKET_TOKEN_SIGNATURE', 'Invalid ticket token signature');
  }

  const parsed = JSON.parse(unbase64url(encodedPayload)) as TicketTokenPayload;

  if (!parsed.ticketCode || !parsed.nonce) {
    throw new DomainError('MALFORMED_TICKET_TOKEN', 'Malformed ticket token');
  }

  return { version: 'v1', ticketCode: parsed.ticketCode, nonce: parsed.nonce };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/domain/ticket-token.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/ticket/token.ts tests/domain/ticket-token.test.ts
git commit -m "feat: add signed ticket token helper"
```

## Task 8: Health Route and Final Verification

**Files:**
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Create health route**

Write `app/api/health/route.ts`:

```ts
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lelampahan',
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Run all checks**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands pass. Build creates `.next` output.

- [ ] **Step 3: Commit**

Run:

```bash
git add app/api/health/route.ts
git commit -m "chore: add health endpoint"
```

## Self-Review Checklist

- Spec coverage for this plan:
  - Modular Next.js foundation: Task 1.
  - Environment validation and shared domain errors: Task 2.
  - Prisma/Postgres schema foundation: Task 3.
  - Order and request-to-book state machines: Task 4.
  - Payment state and idempotency primitives: Task 5.
  - Reservation TTL and capacity policy: Task 6.
  - Signed QR ticket token: Task 7.
  - Health route and verification: Task 8.
- Requirements intentionally deferred to later plans:
  - Public marketplace UI and SEO pages.
  - Partner onboarding UI.
  - Admin approval queues.
  - Actual QRIS provider adapter.
  - Email templates and Resend integration.
  - R2 upload API routes.
  - Scanner UI and check-in persistence service.
  - Ledger, settlement, payout, refunds.
  - Sentry setup and production deployment.
- Placeholder scan: no placeholder tasks remain.
- Type consistency: state names match the Prisma enum names used in this plan.
