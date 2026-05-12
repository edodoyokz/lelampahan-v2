'use client';

import { Button } from '@/components/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CheckoutError({ error, reset }: Props) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-lelampahan-earth">Terjadi Kesalahan</h1>
        <p className="mt-3 text-sm leading-6 text-amber-950/70">
          {error.digest
            ? 'Terjadi kesalahan saat memproses checkout. Silakan coba lagi.'
            : (error.message || 'Terjadi kesalahan saat memproses checkout. Silakan coba lagi.')}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" onClick={reset}>
            Coba Lagi
          </Button>
          <Button variant="ghost" onClick={() => { window.location.href = '/'; }}>
            Kembali ke Marketplace
          </Button>
        </div>
      </div>
    </section>
  );
}
