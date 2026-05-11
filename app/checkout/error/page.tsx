import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutErrorPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <h1 className="mt-5 text-3xl font-bold text-lelampahan-earth">Pembayaran Gagal</h1>
        <p className="mt-3 text-sm leading-6 text-amber-950/70">
          Transaksi belum berhasil diproses. Silakan ulangi checkout atau hubungi dukungan Lelampahan jika pembayaran sudah terpotong.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/checkout">
            <Button variant="primary">Ulangi Checkout</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Kembali ke Marketplace</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
