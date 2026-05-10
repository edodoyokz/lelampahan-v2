# Provider-Pluggable Pakasir QRIS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add provider-pluggable QRIS payment with Mock QRIS for dev/tests and Pakasir sandbox as the first real QRIS provider, rendering the Pakasir QR in Lelampahan checkout.

**Architecture:** `/api/payment/create` remains provider-neutral. It validates auth/order ownership, derives amount/order number from DB, then delegates QRIS creation to `getPaymentProvider()`. The provider factory selects `mock` or `pakasir` from `PAYMENT_PROVIDER`. Pakasir details live only in `src/domain/payment/pakasir.ts` and future webhook normalization. The adapter uses `pakasir-sdk` internally.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, Zod, Vitest, `pakasir-sdk`.

---

## Task 1: Add provider-neutral QRIS provider interface

**Files:**
- Create: `src/domain/payment/provider.ts`
- Test: `tests/domain/payment-provider.test.ts`

**Step 1: Write failing test**

Create `tests/domain/payment-provider.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { QrisPaymentProvider } from '@/domain/payment/provider';

describe('QrisPaymentProvider contract', () => {
  it('allows providers to create normalized QRIS payment results', async () => {
    const provider: QrisPaymentProvider = {
      name: 'mock',
      async createQrisPayment(input) {
        return {
          provider: 'MOCK_QRIS',
          providerRef: `mock-${input.orderNumber}`,
          method: 'QRIS',
          amount: input.amount,
          status: 'PENDING',
          expiresAt: new Date('2026-05-10T10:30:00.000Z'),
          qrString: `lelampahan://qris/${input.orderNumber}`,
          rawPayload: { test: true },
        };
      },
    };

    const result = await provider.createQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-001',
      amount: 100000,
      idempotencyKey: 'payment:create:order-1:1',
    });

    expect(provider.name).toBe('mock');
    expect(result.method).toBe('QRIS');
    expect(result.amount).toBe(100000);
    expect(result.qrString).toContain('lelampahan://qris/LM-001');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/domain/payment-provider.test.ts --run
```

Expected: FAIL because `@/domain/payment/provider` does not exist.

**Step 3: Implement provider interface**

Create `src/domain/payment/provider.ts`:

```ts
import type { CreatePaymentInput, CreatePaymentResult } from './adapter';

export type PaymentProviderName = 'mock' | 'pakasir';

export interface QrisPaymentProvider {
  name: PaymentProviderName;
  createQrisPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}
```

**Step 4: Update adapter result to support raw payload**

Modify `src/domain/payment/adapter.ts`:

```ts
export interface CreatePaymentResult {
  provider: string;
  providerRef: string;
  method: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  expiresAt: Date;
  qrString: string;
  rawPayload?: unknown;
}
```

**Step 5: Run test to verify it passes**

```bash
npm test -- tests/domain/payment-provider.test.ts --run
```

Expected: PASS.

---

## Task 2: Wrap mock QRIS behind provider interface

**Files:**
- Modify: `src/domain/payment/qris-mock.ts`
- Test: `tests/domain/payment-adapter.test.ts`

**Step 1: Write failing test**

Add to `tests/domain/payment-adapter.test.ts`:

```ts
import { mockQrisProvider } from '@/domain/payment/qris-mock';

it('exposes mock QRIS through provider interface', async () => {
  const payment = await mockQrisProvider.createQrisPayment({
    orderId: 'order-1',
    amount: 100000,
    idempotencyKey: 'payment:create:order-1:1',
    orderNumber: 'LM-001',
  });

  expect(mockQrisProvider.name).toBe('mock');
  expect(payment.provider).toBe('MOCK_QRIS');
  expect(payment.method).toBe('QRIS');
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/domain/payment-adapter.test.ts --run
```

Expected: FAIL because `mockQrisProvider` is not exported.

**Step 3: Implement minimal provider wrapper**

Modify `src/domain/payment/qris-mock.ts`:

```ts
import type { QrisPaymentProvider } from './provider';

export const mockQrisProvider: QrisPaymentProvider = {
  name: 'mock',
  async createQrisPayment(input) {
    return createQrisPayment(input);
  },
};
```

Keep existing `createQrisPayment()` export.

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/domain/payment-adapter.test.ts --run
```

Expected: PASS.

---

## Task 3: Add Pakasir QRIS provider

**Files:**
- Create: `src/domain/payment/pakasir.ts`
- Test: `tests/domain/pakasir-adapter.test.ts`

**Step 1: Write failing tests**

Create `tests/domain/pakasir-adapter.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPakasirQrisProvider } from '@/domain/payment/pakasir';

const fetchMock = vi.fn();

describe('Pakasir QRIS provider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('creates QRIS payment through Pakasir transactioncreate API', async () => {
    global.fetch = fetchMock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment: {
          project: 'lelampahan',
          order_id: 'LM-001',
          amount: 100000,
          fee: 1003,
          total_payment: 101003,
          payment_method: 'qris',
          payment_number: 'QR_STRING',
          expired_at: '2026-05-10T10:30:00.000Z',
        },
      }),
    });

    const provider = createPakasirQrisProvider({
      projectSlug: 'lelampahan',
      apiKey: 'pakasir-api-key',
      baseUrl: 'https://app.pakasir.com',
      mode: 'sandbox',
    });

    const result = await provider.createQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-001',
      amount: 100000,
      idempotencyKey: 'payment:create:order-1:1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://app.pakasir.com/api/transactioncreate/qris',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: 'lelampahan',
          order_id: 'LM-001',
          amount: 100000,
          api_key: 'pakasir-api-key',
        }),
      }),
    );
    expect(result.provider).toBe('PAKASIR');
    expect(result.providerRef).toBe('LM-001');
    expect(result.method).toBe('QRIS');
    expect(result.amount).toBe(100000);
    expect(result.qrString).toBe('QR_STRING');
    expect(result.expiresAt.toISOString()).toBe('2026-05-10T10:30:00.000Z');
  });

  it('throws when Pakasir response is not ok', async () => {
    global.fetch = fetchMock;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });

    const provider = createPakasirQrisProvider({
      projectSlug: 'lelampahan',
      apiKey: 'pakasir-api-key',
      baseUrl: 'https://app.pakasir.com',
      mode: 'sandbox',
    });

    await expect(
      provider.createQrisPayment({
        orderId: 'order-1',
        orderNumber: 'LM-001',
        amount: 100000,
        idempotencyKey: 'payment:create:order-1:1',
      }),
    ).rejects.toThrow('Pakasir payment creation failed');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/domain/pakasir-adapter.test.ts --run
```

Expected: FAIL because Pakasir adapter does not exist.

**Step 3: Implement Pakasir provider**

Create `src/domain/payment/pakasir.ts`:

```ts
import { DomainError } from '@/domain/shared/errors';
import type { QrisPaymentProvider } from './provider';

export interface PakasirConfig {
  projectSlug: string;
  apiKey: string;
  baseUrl: string;
  mode: 'sandbox' | 'production';
}

interface PakasirCreateResponse {
  payment?: {
    project: string;
    order_id: string;
    amount: number;
    fee?: number;
    total_payment?: number;
    payment_method: string;
    payment_number: string;
    expired_at: string;
  };
}

export function createPakasirQrisProvider(config: PakasirConfig): QrisPaymentProvider {
  return {
    name: 'pakasir',
    async createQrisPayment(input) {
      const response = await fetch(`${config.baseUrl}/api/transactioncreate/qris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: config.projectSlug,
          order_id: input.orderNumber,
          amount: input.amount,
          api_key: config.apiKey,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new DomainError('PAKASIR_CREATE_PAYMENT_FAILED', 'Pakasir payment creation failed', {
          status: response.status,
          body,
        });
      }

      const data = (await response.json()) as PakasirCreateResponse;
      const payment = data.payment;

      if (!payment?.payment_number || !payment.expired_at) {
        throw new DomainError('PAKASIR_INVALID_RESPONSE', 'Invalid Pakasir payment response');
      }

      if (payment.payment_method !== 'qris') {
        throw new DomainError('PAKASIR_INVALID_METHOD', 'Pakasir returned non-QRIS payment');
      }

      return {
        provider: 'PAKASIR',
        providerRef: payment.order_id,
        method: 'QRIS',
        amount: payment.amount,
        status: 'PENDING',
        expiresAt: new Date(payment.expired_at),
        qrString: payment.payment_number,
        rawPayload: payment,
      };
    },
  };
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/domain/pakasir-adapter.test.ts --run
```

Expected: PASS.

---

## Task 4: Add payment provider factory

**Files:**
- Create: `src/domain/payment/factory.ts`
- Test: `tests/domain/payment-provider-factory.test.ts`

**Step 1: Write failing tests**

Create `tests/domain/payment-provider-factory.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { getPaymentProvider } from '@/domain/payment/factory';

describe('getPaymentProvider', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to mock provider when PAYMENT_PROVIDER is missing', () => {
    delete process.env.PAYMENT_PROVIDER;

    expect(getPaymentProvider().name).toBe('mock');
  });

  it('returns mock provider when PAYMENT_PROVIDER=mock', () => {
    process.env.PAYMENT_PROVIDER = 'mock';

    expect(getPaymentProvider().name).toBe('mock');
  });

  it('returns Pakasir provider when required env is present', () => {
    process.env.PAYMENT_PROVIDER = 'pakasir';
    process.env.PAKASIR_PROJECT_SLUG = 'lelampahan';
    process.env.PAKASIR_API_KEY = 'pakasir-api-key';
    process.env.PAKASIR_BASE_URL = 'https://app.pakasir.com';
    process.env.PAKASIR_MODE = 'sandbox';

    expect(getPaymentProvider().name).toBe('pakasir');
  });

  it('rejects missing Pakasir credentials', () => {
    process.env.PAYMENT_PROVIDER = 'pakasir';
    delete process.env.PAKASIR_PROJECT_SLUG;

    expect(() => getPaymentProvider()).toThrow('Pakasir configuration is incomplete');
  });

  it('rejects unknown payment providers', () => {
    process.env.PAYMENT_PROVIDER = 'midtrans';

    expect(() => getPaymentProvider()).toThrow('Unsupported payment provider');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test -- tests/domain/payment-provider-factory.test.ts --run
```

Expected: FAIL because factory does not exist.

**Step 3: Implement factory**

Create `src/domain/payment/factory.ts`:

```ts
import { DomainError } from '@/domain/shared/errors';
import type { QrisPaymentProvider } from './provider';
import { mockQrisProvider } from './qris-mock';
import { createPakasirQrisProvider } from './pakasir';

export function getPaymentProvider(): QrisPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  if (provider === 'mock') return mockQrisProvider;

  if (provider === 'pakasir') {
    const projectSlug = process.env.PAKASIR_PROJECT_SLUG;
    const apiKey = process.env.PAKASIR_API_KEY;
    const baseUrl = process.env.PAKASIR_BASE_URL ?? 'https://app.pakasir.com';
    const mode = process.env.PAKASIR_MODE === 'production' ? 'production' : 'sandbox';

    if (!projectSlug || !apiKey) {
      throw new DomainError('PAKASIR_CONFIG_MISSING', 'Pakasir configuration is incomplete');
    }

    return createPakasirQrisProvider({ projectSlug, apiKey, baseUrl, mode });
  }

  throw new DomainError(
    'UNSUPPORTED_PAYMENT_PROVIDER',
    `Unsupported payment provider: ${provider}`,
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/domain/payment-provider-factory.test.ts --run
```

Expected: PASS.

---

## Task 5: Route payment creation through provider factory and persist raw payload

**Files:**
- Modify: `app/api/payment/create/route.ts`
- Modify: `src/data/payment.ts`
- Test: existing payment tests

**Step 1: Update payment persistence**

Modify `src/data/payment.ts` so `createPaymentRecord` accepts optional raw payload:

```ts
export async function createPaymentRecord(data: {
  orderId: string;
  provider: string;
  method: string;
  amount: number;
  idempotencyKey: string;
  expiresAt: Date;
  providerRef?: string;
  rawPayload?: unknown;
}) {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: data.provider,
      providerRef: data.providerRef,
      method: data.method,
      amount: data.amount,
      idempotencyKey: data.idempotencyKey,
      expiresAt: data.expiresAt,
      rawPayload: data.rawPayload as object | undefined,
    },
  });
}
```

**Step 2: Update route**

Modify `app/api/payment/create/route.ts`:

- Remove direct `createQrisPayment` import.
- Import `getPaymentProvider`.
- Replace direct mock call with provider call:

```ts
const paymentProvider = getPaymentProvider();
const paymentResult = await paymentProvider.createQrisPayment({
  orderId: order.id,
  amount: order.totalAmount,
  idempotencyKey: input.idempotencyKey,
  orderNumber: order.orderNumber,
});
```

- Persist:

```ts
providerRef: paymentResult.providerRef,
rawPayload: paymentResult.rawPayload,
```

**Step 3: Run focused tests**

```bash
npm test -- tests/data/payment-order.test.ts tests/domain/payment-adapter.test.ts tests/domain/pakasir-adapter.test.ts tests/domain/payment-provider-factory.test.ts --run
```

Expected: PASS.

---

## Task 6: Add Pakasir sandbox simulation helper

**Files:**
- Modify: `src/domain/payment/pakasir.ts`
- Create: `app/api/payment/pakasir/simulate/route.ts`
- Test: `tests/domain/pakasir-adapter.test.ts`

**Step 1: Add failing test for simulation client**

Add to `tests/domain/pakasir-adapter.test.ts`:

```ts
import { simulatePakasirPayment } from '@/domain/payment/pakasir';

it('calls Pakasir payment simulation API', async () => {
  global.fetch = fetchMock;
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true }),
  });

  await expect(
    simulatePakasirPayment({
      projectSlug: 'lelampahan',
      apiKey: 'pakasir-api-key',
      baseUrl: 'https://app.pakasir.com',
      orderNumber: 'LM-001',
      amount: 100000,
    }),
  ).resolves.toEqual({ success: true });

  expect(fetchMock).toHaveBeenCalledWith(
    'https://app.pakasir.com/api/paymentsimulation',
    expect.objectContaining({ method: 'POST' }),
  );
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/domain/pakasir-adapter.test.ts --run
```

Expected: FAIL because `simulatePakasirPayment` does not exist.

**Step 3: Implement simulation helper**

Add to `src/domain/payment/pakasir.ts`:

```ts
export async function simulatePakasirPayment(input: {
  projectSlug: string;
  apiKey: string;
  baseUrl: string;
  orderNumber: string;
  amount: number;
}) {
  const response = await fetch(`${input.baseUrl}/api/paymentsimulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: input.projectSlug,
      order_id: input.orderNumber,
      amount: input.amount,
      api_key: input.apiKey,
    }),
  });

  if (!response.ok) {
    throw new DomainError('PAKASIR_SIMULATION_FAILED', 'Pakasir payment simulation failed');
  }

  return response.json();
}
```

**Step 4: Add guarded API route**

Create `app/api/payment/pakasir/simulate/route.ts`:

- Require authenticated user.
- Require `PAKASIR_MODE=sandbox`.
- Accept `orderId`.
- Resolve user profile.
- Load pending payment order scoped to user.
- Call `simulatePakasirPayment()` with order number and amount.

The route must return 403 when `PAKASIR_MODE !== 'sandbox'`.

**Step 5: Run focused tests**

```bash
npm test -- tests/domain/pakasir-adapter.test.ts --run
```

Expected: PASS.

---

## Task 7: Add Pakasir webhook verification and normalization design hook

**Files:**
- Modify: `src/domain/payment/pakasir.ts`
- Modify: `app/api/payment/webhook/route.ts`
- Test: later route/domain tests

**Step 1: Add transaction detail helper**

Add helper to Pakasir adapter:

```ts
export async function fetchPakasirTransactionDetail(input: {
  projectSlug: string;
  apiKey: string;
  baseUrl: string;
  orderNumber: string;
  amount: number;
})
```

It calls:

```txt
GET /api/transactiondetail?project=...&amount=...&order_id=...&api_key=...
```

**Step 2: Update webhook route behavior**

Before marking paid:

- Check provider payload matches Pakasir project/order/amount.
- Call transaction detail.
- Only accept status `completed` and method `qris`.
- Use deterministic provider event id:

```txt
pakasir:completed:{order_id}
```

**Step 3: Keep idempotency**

Ensure repeated webhook does not issue duplicate tickets. Reuse existing fulfillment/idempotency services if available.

---

## Task 8: Update env docs

**Files:**
- Modify: `.env.example`
- Modify: deployment notes if any

**Step 1: Update `.env.example`**

Add:

```env
PAYMENT_PROVIDER="mock"
PAKASIR_MODE="sandbox"
PAKASIR_PROJECT_SLUG=""
PAKASIR_API_KEY=""
PAKASIR_BASE_URL="https://app.pakasir.com"
```

Midtrans keys can remain optional but should not be described as active provider.

**Step 2: Update Vercel recommendation**

For Pakasir sandbox deploy:

```env
PAYMENT_PROVIDER=pakasir
PAKASIR_MODE=sandbox
PAKASIR_PROJECT_SLUG=...
PAKASIR_API_KEY=...
PAKASIR_BASE_URL=https://app.pakasir.com
```

---

## Task 9: Final verification

**Step 1: Run full verification**

```bash
npm run typecheck
npm test -- --run
npm run lint
npm run build
```

Expected:

- Typecheck PASS
- Tests PASS
- Lint PASS
- Build PASS

**Step 2: Manual sandbox test**

On Vercel or local with ngrok/public URL:

1. Set Pakasir project webhook URL to:

```txt
https://your-domain.com/api/payment/webhook
```

2. Create checkout order.
3. Create Pakasir QRIS payment.
4. Confirm QR string appears in Lelampahan checkout.
5. Call sandbox simulation route or Pakasir sandbox payment simulation.
6. Verify order becomes paid and ticket is issued.
