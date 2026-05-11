import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPendingPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-yellow-700">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
          </svg>
        </div>
        <h1 className="mt-5 text-3xl font-bold text-lelampahan-earth">Pembayaran Menunggu Konfirmasi</h1>
        <p className="mt-3 text-sm leading-6 text-amber-950/70">
          Kami sedang menunggu konfirmasi pembayaran dari penyedia QRIS. Jika pembayaran sudah berhasil, tiket akan muncul otomatis setelah pembayaran terkonfirmasi.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/account/orders">
            <Button variant="primary">Lihat Pesanan</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
