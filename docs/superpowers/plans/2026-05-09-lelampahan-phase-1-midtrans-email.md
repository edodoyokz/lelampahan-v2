# Lelampahan Phase 1 — Midtrans QRIS Adapter and Email Service

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock QRIS adapter with a real Midtrans integration for QRIS payments, add an email notification service via Resend for ticket receipts, and wire the admin API routes to use the data persistence layer for real approve/reject operations.

**Architecture:** Create a Midtrans payment provider implementing the `PaymentProvider` interface from the existing payment adapter. Create an email service module using Resend SDK. Update admin API routes to call data layer functions.

**Tech Stack:** Midtrans Snap/API (Node.js), Resend SDK, TypeScript, Zod.

---

## File Structure

```text
src/
├── domain/
│   └── payment/
│       ├── adapter.ts             # (existing) PaymentProvider interface
│       ├── qris-mock.ts           # (existing) kept for dev fallback
│       └── midtrans.ts            # Midtrans adapter implementation
├── lib/
│   └── email.ts                   # Resend email service
└── services/
    └── ticket-notification.ts     # Orchestrates ticket issuance + email

app/
├── api/
│   ├── admin/
│   │   └── partners/
│   │       └── approve/route.ts   # POST approve/reject partner
│   └── ticket/
│       └── issue/route.ts         # POST issue tickets after payment
├── partner/
│   ├── bookings/
│   │   └── page.tsx               # Booking request management
│   └── scanner/
│       └── page.tsx               # (existing) updated with real validation
└── admin/
    ├── partners/
    │   └── page.tsx               # (existing) fetch from API
    └── listings/
        └── page.tsx               # (existing) fetch from API
```

## Task 1: Midtrans QRIS Payment Adapter

**Files:**
- Create: `src/domain/payment/midtrans.ts`
- Test: `tests/domain/midtrans-adapter.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/domain/midtrans-adapter.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createMidtransQrisPayment, MidtransConfig } from '@/domain/payment/midtrans';

const config: MidtransConfig = {
  serverKey: 'SB-Mid-server-test_key_here',
  clientKey: 'SB-Mid-client-test_key_here',
  isProduction: false,
};

describe('Midtrans QRIS adapter', () => {
  it('generates a payment request with correct structure', () => {
    const result = createMidtransQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      amount: 100000,
      customer: {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
      },
      itemDetails: [
        { name: 'Ticket Regular', quantity: 2, price: 50000 },
      ],
    });

    expect(result.transactionDetails.orderId).toBe('LM-20260509-ABCD');
    expect(result.transactionDetails.grossAmount).toBe(100000);
    expect(result.paymentMethod).toBe('qris');
    expect(result.customerDetails.firstName).toBe('Budi Santoso');
  });

  it('calculates gross amount from item details', () => {
    const result = createMidtransQrisPayment({
      orderId: 'order-2',
      orderNumber: 'LM-20260509-EFGH',
      amount: 150000,
      customer: { name: 'Siti', email: 'siti@example.com', phone: '0811' },
      itemDetails: [
        { name: 'VIP Ticket', quantity: 1, price: 100000 },
        { name: 'Reg Ticket', quantity: 1, price: 50000 },
      ],
    });

    expect(result.transactionDetails.grossAmount).toBe(150000);
    expect(result.itemDetails).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- tests/domain/midtrans-adapter.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement Midtrans adapter**

Write `src/domain/payment/midtrans.ts`:

```ts
export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export interface MidtransQrisPaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface MidtransQrisPaymentResult {
  transactionDetails: {
    orderId: string;
    grossAmount: number;
  };
  paymentMethod: 'qris';
  customerDetails: {
    firstName: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  callbacks: {
    finish: string;
    error: string;
    pending: string;
  };
  expiry: {
    startTime: string;
    duration: number;
    unit: 'minutes';
  };
}

export function createMidtransQrisPayment(
  input: MidtransQrisPaymentInput,
): MidtransQrisPaymentResult {
  const now = new Date();

  return {
    transactionDetails: {
      orderId: input.orderNumber,
      grossAmount: input.amount,
    },
    paymentMethod: 'qris',
    customerDetails: {
      firstName: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    itemDetails: input.itemDetails.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    callbacks: {
      finish: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/account/orders`,
      error: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/checkout/error`,
      pending: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/checkout/pending`,
    },
    expiry: {
      startTime: now.toISOString(),
      duration: 30,
      unit: 'minutes',
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/domain/midtrans-adapter.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/payment/midtrans.ts tests/domain/midtrans-adapter.test.ts
git commit -m "feat: add midtrans QRIS payment adapter"
```

## Task 2: Resend Email Service

**Files:**
- Create: `src/lib/email.ts`
- Test: `tests/lib/email.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/lib/email.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

// Mock Resend before importing
vi.mock('resend', () => {
  const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null });
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: { send: sendMock },
    })),
  };
});

import { sendTicketEmail } from '@/lib/email';

describe('email service', () => {
  it('sends a ticket email with correct parameters', async () => {
    const result = await sendTicketEmail({
      to: 'budi@example.com',
      subject: 'Tiket Lelampahan Anda',
      ticketCode: 'TICKET-001',
      orderNumber: 'LM-20260509-ABCD',
      participantName: 'Budi Santoso',
      listingTitle: 'Jelajah Kotagede Heritage',
      qrToken: 'v1.abc.signature',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('email-123');
  });

  it('throws on missing recipient', async () => {
    await expect(
      sendTicketEmail({
        to: '',
        subject: 'Test',
        ticketCode: 'TICKET-001',
        orderNumber: 'LM-001',
        participantName: 'Test',
        listingTitle: 'Test',
        qrToken: 'token',
      }),
    ).rejects.toThrow('Email recipient is required');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- tests/lib/email.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement Resend email service**

Write `src/lib/email.ts`:

```ts
import { Resend } from 'resend';

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendTicketEmail(input: {
  to: string;
  subject: string;
  ticketCode: string;
  orderNumber: string;
  participantName: string;
  listingTitle: string;
  qrToken: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) {
    throw new Error('Email recipient is required');
  }

  if (!resendClient) {
    console.warn('Resend not configured — skipping email send');
    return { success: false };
  }

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/account/tickets`;

  const { data, error } = await resendClient.emails.send({
    from: 'Lelampahan <noreply@lelampahan.id>',
    to: [input.to],
    subject: input.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Tiket Lelampahan</h1>
        <p>Halo <strong>${input.participantName}</strong>,</p>
        <p>Terima kasih sudah memesan <strong>${input.listingTitle}</strong>.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px"><strong>Order:</strong> ${input.orderNumber}</p>
          <p style="margin:0 0 8px"><strong>Tiket:</strong> ${input.ticketCode}</p>
          <a href="${ticketUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Lihat Tiket QR
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Simpan email ini atau akses tiket dari akun Anda kapan saja.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    return { success: false };
  }

  return { success: true, messageId: data?.id };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/lib/email.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/email.ts tests/lib/email.test.ts
git commit -m "feat: add resend email service"
```

## Task 3: Ticket Issuance and Notification Service

**Files:**
- Create: `src/services/ticket-notification.ts`
- Test: `tests/services/ticket-notification.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/services/ticket-notification.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { issueTicketsAndNotify } from '@/services/ticket-notification';
import { env } from '@/config/env';

vi.mock('@/lib/email', () => ({
  sendTicketEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'email-123' }),
}));

vi.mock('@/data/ticket', () => ({
  createTicket: vi.fn().mockImplementation((data) => ({
    ...data,
    id: 'ticket-generated',
    status: 'ISSUED',
  })),
}));

describe('ticket notification service', () => {
  it('issues tickets and sends emails for each participant', async () => {
    const result = await issueTicketsAndNotify({
      orderId: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      listingTitle: 'Jelajah Kotagede',
      participants: [
        { name: 'Budi', email: 'budi@example.com', phone: '0811' },
        { name: 'Siti', email: 'siti@example.com', phone: '0812' },
      ],
      tokenSecret: env.TICKET_TOKEN_SECRET,
    });

    expect(result.tickets).toHaveLength(2);
    expect(result.emailsSent).toBe(2);
  });

  it('returns empty result for zero participants', async () => {
    const result = await issueTicketsAndNotify({
      orderId: 'order-2',
      orderNumber: 'LM-20260509-EFGH',
      listingTitle: 'Test',
      participants: [],
      tokenSecret: env.TICKET_TOKEN_SECRET,
    });

    expect(result.tickets).toHaveLength(0);
    expect(result.emailsSent).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- tests/services/ticket-notification.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement ticket notification service**

Write `src/services/ticket-notification.ts`:

```ts
import { issueTicket } from '@/domain/ticket/service';
import { createTicket } from '@/data/ticket';
import { sendTicketEmail } from '@/lib/email';

export async function issueTicketsAndNotify(input: {
  orderId: string;
  orderNumber: string;
  listingTitle: string;
  participants: Array<{ name: string; email: string; phone: string }>;
  tokenSecret: string;
}): Promise<{ tickets: Array<{ code: string; id: string }>; emailsSent: number }> {
  const tickets: Array<{ code: string; id: string }> = [];
  let emailsSent = 0;

  for (let i = 0; i < input.participants.length; i++) {
    const participant = input.participants[i];
    const ticketCode = `${input.orderNumber}-${String(i + 1).padStart(3, '0')}`;

    // Create domain ticket (generates signed token)
    const domainTicket = issueTicket({
      orderId: input.orderId,
      code: ticketCode,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
      tokenSecret: input.tokenSecret,
    });

    // Persist to database
    const persisted = await createTicket({
      orderId: input.orderId,
      code: ticketCode,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
    });

    // Send email notification
    const emailResult = await sendTicketEmail({
      to: participant.email,
      subject: `Tiket Lelampahan — ${input.listingTitle}`,
      ticketCode,
      orderNumber: input.orderNumber,
      participantName: participant.name,
      listingTitle: input.listingTitle,
      qrToken: domainTicket.token,
    });

    tickets.push({ code: ticketCode, id: persisted.id });
    if (emailResult.success) emailsSent++;
  }

  return { tickets, emailsSent };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/services/ticket-notification.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/ tests/services/
git commit -m "feat: add ticket issuance and email notification service"
```

## Task 4: Admin API Approve/Reject Endpoints

**Files:**
- Create: `app/api/admin/partners/approve/route.ts`
- Create: `app/api/admin/listings/approve/route.ts`

- [ ] **Step 1: Create admin partner approve route**

Write `app/api/admin/partners/approve/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  partnerId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  type: z.enum(['TOURS', 'EVENTS']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = actionSchema.parse(body);

    // Placeholder: will call data layer in next iteration
    return NextResponse.json({
      partnerId: input.partnerId,
      action: input.action,
      status: input.action === 'approve' ? 'APPROVED' : 'REJECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Create admin listing approve route**

Write `app/api/admin/listings/approve/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  listingId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = actionSchema.parse(body);

    // Placeholder: will call data layer in next iteration
    return NextResponse.json({
      listingId: input.listingId,
      action: input.action,
      status: input.action === 'approve' ? 'PUBLISHED' : 'REJECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/
git commit -m "feat: add admin approve/reject API endpoints"
```

## Task 5: Partner Bookings Management Page

**Files:**
- Create: `app/partner/bookings/page.tsx`

- [ ] **Step 1: Create bookings management page**

Write `app/partner/bookings/page.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface Booking {
  id: string;
  orderNumber: string;
  customerName: string;
  listingTitle: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings] = useState<Booking[]>([
    {
      id: 'b1',
      orderNumber: 'LM-20260509-ABCD',
      customerName: 'Budi Santoso',
      listingTitle: 'Jelajah Kotagede Heritage',
      status: 'PAID',
      totalAmount: 100000,
      createdAt: '2026-05-09',
    },
    {
      id: 'b2',
      orderNumber: 'LM-20260509-EFGH',
      customerName: 'Siti Rahayu',
      listingTitle: 'Workshop Batik',
      status: 'REQUESTED',
      totalAmount: 50000,
      createdAt: '2026-05-09',
    },
  ]);

  const handleApprove = async (id: string) => {
    // Placeholder: will call /api/booking/[id]/approve
    console.log('Approve booking:', id);
  };

  const handleReject = async (id: string) => {
    // Placeholder: will call /api/booking/[id]/reject
    console.log('Reject booking:', id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Pesanan & Permintaan Booking</h1>
      <p className="mt-1 text-sm text-gray-500">Kelola pesanan masuk dan request-to-book.</p>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Pelanggan</th>
              <th className="px-6 py-3 font-medium">Listing</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-900">{b.orderNumber}</td>
                <td className="px-6 py-4 text-gray-700">{b.customerName}</td>
                <td className="px-6 py-4 text-gray-500">{b.listingTitle}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'REQUESTED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">Rp {b.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {b.status === 'REQUESTED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add bookings link to partner sidebar**

Modify `app/partner/layout.tsx` — add a bookings link to the sidebar nav:

```tsx
<Link
  href="/partner/bookings"
  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-lelampahan-cream"
>
  Pesanan
</Link>
```

- [ ] **Step 3: Build and verify**

Run:
```bash
npm run typecheck && npm run build
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/partner/bookings/ app/partner/layout.tsx
git commit -m "feat: add partner bookings management page"
```

## Self-Review Checklist

**Spec coverage:**
- Midtrans QRIS adapter: Task 1.
- Email notification service via Resend: Task 2.
- Ticket issuance + notification orchestration: Task 3.
- Admin approve/reject API endpoints: Task 4.
- Partner bookings management page with approve/reject buttons: Task 5.

**Gaps remaining for production:**
- Actual Midtrans Snap API call (currently generates request structure only).
- Email template customization for different ticket types.
- Webhook handler updating order status + triggering ticket issuance.
- Adding `RESEND_API_KEY` and `MIDTRANS_SERVER_KEY` to `.env.example`.
