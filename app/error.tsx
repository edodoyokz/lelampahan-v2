'use client';

import { Button } from '@/components/ui/button';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ reset }: RootErrorProps) {
  return (
    <html lang="id">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-lelampahan-cream px-6 py-16">
          <section className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-lelampahan-earth">Terjadi Kesalahan</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Coba muat ulang halaman. Jika masalah masih terjadi, silakan kembali ke marketplace atau hubungi dukungan Lelampahan.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="primary" onClick={reset}>Coba Lagi</Button>
              <Button variant="ghost" onClick={() => { window.location.href = '/'; }}>Kembali ke Marketplace</Button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
