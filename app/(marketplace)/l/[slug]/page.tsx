import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findListingBySlug } from '@/data/listing';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListingBySlug(slug).catch(() => null);

  if (!listing) {
    return { title: 'Listing tidak ditemukan' };
  }

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      type: 'article',
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const listing = await findListingBySlug(slug).catch(() => null);

  if (!listing) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lelampahan-brick">
          Lelampahan / Listing
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-lelampahan-earth">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="mt-6 text-amber-950/70">Detail listing akan dimuat dari database.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lelampahan-brick">
        Lelampahan / {listing.type}
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-lelampahan-earth">
        {listing.title}
      </h1>
      <p className="mt-6 text-amber-950/70">{listing.description}</p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-lelampahan-earth">Jadwal Tersedia</h2>
        {listing.sessions.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Belum ada jadwal tersedia.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {listing.sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Intl.DateTimeFormat('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: listing.timezone,
                    }).format(session.startsAt)}
                  </p>
                  <p className="text-sm text-gray-500">Kapasitas {session.capacity} peserta</p>
                </div>
                <a href={`/checkout?sessionId=${session.id}`} className="rounded-full bg-lelampahan-gold px-4 py-2 text-sm font-semibold text-white">
                  Checkout
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
