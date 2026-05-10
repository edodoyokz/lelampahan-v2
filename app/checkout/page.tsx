import { Suspense } from 'react';
import { CheckoutClient } from './checkout-client';

function CheckoutFallback() {
  return (
    <section className="mx-auto max-w-lg px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="h-48 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutClient />
    </Suspense>
  );
}
