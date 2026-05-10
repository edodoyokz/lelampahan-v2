# Provider-Pluggable QRIS Payment Design

## Context

Lelampahan needs QRIS payment, not a hard dependency on Midtrans/Xendit. The chosen first real provider is Pakasir in sandbox mode. The current product direction is:

- QRIS is the product requirement.
- Pakasir is the first real QRIS provider.
- Mock QRIS remains available for local development/tests.
- QR should be shown inside Lelampahan checkout, not by redirecting users to Pakasir.

## Decision

Use a provider-pluggable QRIS architecture with two providers for now:

```env
PAYMENT_PROVIDER=mock
# or
PAYMENT_PROVIDER=pakasir
```

For real sandbox testing:

```env
PAYMENT_PROVIDER=pakasir
PAKASIR_MODE=sandbox
```

Midtrans and Xendit are no longer the immediate target. They remain possible future providers behind the same interface.

## Architecture

```text
Checkout UI
  -> /api/payment/create
  -> Payment service / route validation
  -> Payment provider factory
  -> QrisPaymentProvider
       -> Mock QRIS provider
       -> Pakasir QRIS provider
```

Core booking, reservation, order, ticket, and settlement logic must not import Pakasir directly. Pakasir details live only in the payment provider adapter and webhook normalizer. The adapter uses `pakasir-sdk` internally to call Pakasir APIs.

## Provider Interface

The provider interface expresses internal QRIS behavior:

```ts
type PaymentProviderName = 'mock' | 'pakasir';

interface QrisPaymentProvider {
  name: PaymentProviderName;
  createQrisPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}
```

Later webhook support should normalize provider payloads into internal payment events:

```ts
interface NormalizedPaymentEvent {
  provider: 'PAKASIR';
  providerEventId: string;
  providerRef: string;
  orderNumber: string;
  status: 'PAID' | 'EXPIRED' | 'FAILED';
  amount: number;
  rawPayload: unknown;
}
```

## Pakasir Payment Creation

Use Pakasir API integration through `pakasir-sdk`, not redirect URL.

The SDK wraps the underlying endpoint:

```txt
POST https://app.pakasir.com/api/transactioncreate/qris
```

Request body:

```json
{
  "project": "PAKASIR_PROJECT_SLUG",
  "order_id": "LM-ORDER-NUMBER",
  "amount": 100000,
  "api_key": "PAKASIR_API_KEY"
}
```

Pakasir response includes:

```json
{
  "payment": {
    "project": "depodomain",
    "order_id": "LM-ORDER-NUMBER",
    "amount": 100000,
    "fee": 1003,
    "total_payment": 101003,
    "payment_method": "qris",
    "payment_number": "QR_STRING",
    "expired_at": "..."
  }
}
```

Map it into internal payment result:

```txt
provider     = PAKASIR
providerRef  = orderNumber
method       = QRIS
amount       = order.totalAmount
status       = PENDING
expiresAt    = payment.expired_at
qrString     = payment.payment_number
rawPayload   = full Pakasir payment payload
```

The user should see the Pakasir QR string rendered in Lelampahan checkout.

## Amount and Fees

Pakasir has both:

```txt
amount        = merchant/order amount
total_payment = amount + fee
```

For MVP:

- Keep `Payment.amount = order.totalAmount`.
- Store `fee` and `total_payment` in `rawPayload`.
- The UI may display provider payable amount if returned, but the DB schema does not need new fee fields yet.

If fee reporting becomes important, add explicit fields later:

```txt
providerFee
payableAmount
```

## Payment Create Data Flow

1. Client posts only `orderId` and `idempotencyKey` to `/api/payment/create`.
2. API authenticates user.
3. API resolves Supabase auth id to `UserProfile.id`.
4. API loads pending order scoped to that profile.
5. API derives `orderNumber` and `amount` from DB.
6. API calls selected QRIS provider.
7. API stores normalized payment record.
8. API returns QR string and expiry to client.

The client never submits trusted user id, amount, order number, or provider.

## Pakasir Webhook Design

Pakasir webhook payload example:

```json
{
  "amount": 100000,
  "order_id": "LM-ORDER-NUMBER",
  "project": "depodomain",
  "status": "completed",
  "payment_method": "qris",
  "completed_at": "2024-09-10T08:07:02.819+07:00"
}
```

Because the docs do not show a webhook signature, webhook processing must verify the payment by calling Transaction Detail API before marking an order paid.

Transaction detail endpoint:

```txt
GET https://app.pakasir.com/api/transactiondetail?project={slug}&amount={amount}&order_id={order_id}&api_key={api_key}
```

Webhook validation steps:

1. Check `project === PAKASIR_PROJECT_SLUG`.
2. Check `payment_method === 'qris'`.
3. Find order by `orderNumber = order_id`.
4. Check webhook amount equals order total.
5. Call Pakasir Transaction Detail API.
6. Confirm status is `completed`.
7. Process idempotently:
   - update payment to `PAID`
   - mark order paid
   - consume reservation
   - issue tickets
   - send notification if configured

Deterministic webhook event id:

```txt
pakasir:completed:{order_id}
```

## Sandbox Simulation

Pakasir sandbox supports payment simulation:

```txt
POST https://app.pakasir.com/api/paymentsimulation
```

Request body:

```json
{
  "project": "PAKASIR_PROJECT_SLUG",
  "order_id": "LM-ORDER-NUMBER",
  "amount": 100000,
  "api_key": "PAKASIR_API_KEY"
}
```

Recommended internal helper endpoint:

```txt
POST /api/payment/pakasir/simulate
```

Only enable it when:

```env
PAKASIR_MODE=sandbox
```

It must require auth and/or a secret. It should never run in production live mode.

## Environment Variables

Required for Pakasir:

```env
PAYMENT_PROVIDER=pakasir
PAKASIR_MODE=sandbox
PAKASIR_PROJECT_SLUG=
PAKASIR_API_KEY=
PAKASIR_BASE_URL=https://app.pakasir.com
```

For local mock mode:

```env
PAYMENT_PROVIDER=mock
```

## Deployment Guidance

For Vercel staging with real Pakasir sandbox QRIS:

```env
PAYMENT_PROVIDER=pakasir
PAKASIR_MODE=sandbox
PAKASIR_PROJECT_SLUG=...
PAKASIR_API_KEY=...
PAKASIR_BASE_URL=https://app.pakasir.com
```

This can exercise real Pakasir sandbox transaction creation and payment simulation, but it is not live customer payment until Pakasir project mode and operational checks are production-ready.
