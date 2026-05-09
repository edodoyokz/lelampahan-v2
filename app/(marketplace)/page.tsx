import Link from 'next/link';
import { listPublishedListings } from '@/data/listing';

export default async function HomePage() {
  const listings = await listPublishedListings().catch(() => []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lelampahan-brick">
        Yogyakarta-first marketplace
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-lelampahan-earth">
        Lelampahan
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-amber-950/80">
        Temukan tur, paket perjalanan, dan event seru di Yogyakarta.
        Pesan tiket, dapatkan QR, dan nikmati pengalaman bersama Lelampahan.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {listings.map((listing) => {
          const firstTicketType = listing.sessions[0]?.ticketTypes[0];
          return (
            <Link
              key={listing.id}
              href={`/l/${listing.slug}`}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-lelampahan-cream px-3 py-1 text-xs font-semibold text-lelampahan-brick">
                  {listing.type}
                </span>
                <span className="text-xs text-gray-500">{listing.partner.name}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-lelampahan-earth">{listing.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-amber-950/70">
                {listing.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-gray-500">{listing.sessions.length} jadwal tersedia</span>
                <span className="font-semibold text-lelampahan-brick">
                  {firstTicketType ? `Mulai Rp ${firstTicketType.price.toLocaleString('id-ID')}` : 'Lihat detail'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {listings.length === 0 && (
        <div className="mt-10 rounded-2xl border bg-white p-8 text-sm text-gray-500">
          Belum ada listing publish. Jalankan seed atau approve listing dari admin.
        </div>
      )}
    </section>
  );
}
