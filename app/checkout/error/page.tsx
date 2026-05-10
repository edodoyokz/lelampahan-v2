import Link from 'next/link';

export default function CheckoutErrorPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Pembayaran Gagal</h1>
      <p className="mt-3 text-amber-950/70">Silakan coba checkout ulang atau hubungi dukungan Lelampahan.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-lelampahan-gold px-6 py-3 text-sm font-semibold text-white">Kembali ke Marketplace</Link>
    </section>
  );
}
