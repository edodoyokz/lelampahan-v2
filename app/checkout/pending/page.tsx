export default function CheckoutPendingPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Pembayaran Menunggu Konfirmasi</h1>
      <p className="mt-3 text-amber-950/70">Jika pembayaran QRIS sudah berhasil, tiket akan muncul otomatis setelah webhook diterima.</p>
      <a href="/account/orders" className="mt-6 inline-flex rounded-full bg-lelampahan-gold px-6 py-3 text-sm font-semibold text-white">Lihat Pesanan</a>
    </section>
  );
}
