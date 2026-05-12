import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { findListingBySlug } from '@/data/listing';
import { computeSessionRemainingCapacity } from '@/data/session';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { normalizeItinerary, normalizeStringList } from '@/domain/listing/display';
import { ListingDetailClient } from './listing-detail-client';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ListingImageForDisplay {
  url: string;
  alt: string | null;
  isCover: boolean;
}

interface ListingSessionForPicker {
  id: string;
  startsAt: Date;
  capacity: number;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListingBySlug(slug).catch(() => null);

  if (!listing) {
    return { title: 'Pengalaman tidak ditemukan' };
  }

  const coverImage = (listing.images as ListingImageForDisplay[] | undefined)?.find((image) => image.isCover) ??
    (listing.images as ListingImageForDisplay[] | undefined)?.[0];
  const imageUrl = coverImage?.url;

  return {
    title: `${listing.title} | Lelampahan`,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      type: 'article',
      images: imageUrl ? [{ url: imageUrl, alt: listing.title }] : undefined,
    },
  };
}

function ListingDetailSkeleton() {
  return (
    <div className="py-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <SkeletonLoader variant="text" lines={1} className="max-w-xs" />

      {/* Image gallery skeleton */}
      <SkeletonLoader variant="image" className="rounded-xl" />

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonLoader variant="text" lines={1} className="max-w-sm" />
          <SkeletonLoader variant="text" lines={4} />
        </div>
        <div className="space-y-4">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    </div>
  );
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const listing = await findListingBySlug(slug).catch(() => null);

  if (!listing) {
    notFound();
  }

  const typeLabel = listing.type === 'TOUR' ? 'Tur' : 'Acara';
  const typeBadgeStatus = listing.type === 'TOUR' ? 'info' : 'warning';
  const itineraryItems = normalizeItinerary(listing.tourDetail?.itinerary);
  const includedItems = normalizeStringList(listing.tourDetail?.included);
  const excludedItems = normalizeStringList(listing.tourDetail?.excluded);
  const coverImage = (listing.images as ListingImageForDisplay[] | undefined)?.find((image) => image.isCover) ??
    (listing.images as ListingImageForDisplay[] | undefined)?.[0];
  const imageUrl = coverImage?.url;

  // Prepare sessions data for the client component
  const sessionsForPicker = await Promise.all(
    listing.sessions.map(async (session: ListingSessionForPicker) => {
      const remainingCapacity = await computeSessionRemainingCapacity(session.id);
      return {
        id: session.id,
        startsAt: session.startsAt.toISOString(),
        capacity: session.capacity,
        remainingCapacity,
        ticketTypes: session.ticketTypes.map((tt) => ({
          id: tt.id,
          name: tt.name,
          price: tt.price,
        })),
      };
    }),
  );

  return (
    <Suspense fallback={<ListingDetailSkeleton />}>
      <div className="py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-lelampahan-gold transition-colors">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li>
              <Link href="/" className="hover:text-lelampahan-gold transition-colors">
                Jelajahi
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li>
              <span className="text-lelampahan-earth font-medium">{listing.title}</span>
            </li>
          </ol>
        </nav>

        {/* Image Gallery Section */}
        <section aria-label="Galeri gambar pengalaman">
          <div className="relative aspect-video w-full rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
            {imageUrl ? (
              <Image src={imageUrl} alt={coverImage?.alt ?? listing.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" priority />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="mt-2 text-sm">Gambar belum tersedia</p>
              </div>
            )}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Listing Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Type */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={typeBadgeStatus} label={typeLabel} size="md" />
                {listing.tourDetail?.duration && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {listing.tourDetail.duration}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-lelampahan-earth">
                {listing.title}
              </h1>
            </div>

            {/* Location */}
            {listing.eventDetail?.venue && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-5 w-5 text-lelampahan-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{listing.eventDetail.venue}</span>
              </div>
            )}

            {/* Description */}
            <Card variant="outlined" padding="md">
              <h2 className="text-lg font-semibold text-lelampahan-earth mb-3">Tentang Pengalaman Ini</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </Card>

            {/* Tour Details - Rencana Perjalanan, Included, Excluded */}
            {listing.tourDetail && (
              <div className="space-y-4">
                {itineraryItems.length > 0 && (
                  <Card variant="outlined" padding="md">
                    <h2 className="text-lg font-semibold text-lelampahan-earth mb-4">Rencana Perjalanan</h2>
                    <ol className="space-y-4">
                      {itineraryItems.map((item, index) => (
                        <li key={`${item.time ?? 'step'}-${index}`} className="relative flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lelampahan-gold/10 text-sm font-semibold text-lelampahan-gold">
                              {index + 1}
                            </span>
                            {index < itineraryItems.length - 1 && (
                              <span className="mt-2 h-full w-px flex-1 bg-gray-200" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0 pb-1">
                            {item.time && (
                              <p className="text-sm font-medium text-lelampahan-brick">{item.time}</p>
                            )}
                            <p className="text-gray-700 leading-relaxed">{item.activity}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                )}
                {(includedItems.length > 0 || excludedItems.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {includedItems.length > 0 && (
                      <Card variant="outlined" padding="md">
                        <h2 className="text-lg font-semibold text-lelampahan-earth mb-3">Termasuk</h2>
                        <ul className="space-y-2">
                          {includedItems.map((item) => (
                            <li key={item} className="flex gap-2 text-gray-700">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                    {excludedItems.length > 0 && (
                      <Card variant="outlined" padding="md">
                        <h2 className="text-lg font-semibold text-lelampahan-earth mb-3">Tidak Termasuk</h2>
                        <ul className="space-y-2">
                          {excludedItems.map((item) => (
                            <li key={item} className="flex gap-2 text-gray-700">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Event Details - Gate Notes */}
            {listing.eventDetail?.gateNotes && (
              <Card variant="outlined" padding="md">
                <h2 className="text-lg font-semibold text-lelampahan-earth mb-3">Informasi Kedatangan</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {listing.eventDetail.gateNotes}
                </p>
              </Card>
            )}
          </div>

          {/* Right Column - Session Picker & Partner Info */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            {/* Session Picker */}
            <Card variant="elevated" padding="md">
              <h2 className="text-lg font-semibold text-lelampahan-earth mb-4">Pilih Jadwal</h2>
              {sessionsForPicker.length === 0 ? (
                <EmptyState
                  title="Jadwal belum tersedia"
                  description="Penyelenggara belum membuka jadwal untuk pengalaman ini. Silakan cek kembali nanti."
                  illustration={
                    <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                />
              ) : (
                <ListingDetailClient
                  sessions={sessionsForPicker}
                  timezone={listing.timezone}
                />
              )}
            </Card>

            {/* Partner/Organizer Info */}
            <Card variant="outlined" padding="md">
              <h2 className="text-lg font-semibold text-lelampahan-earth mb-3">
                {listing.type === 'TOUR' ? 'Penyelenggara Tur' : 'Penyelenggara Acara'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-lelampahan-gold/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-lelampahan-gold">
                    {listing.partner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{listing.partner.name}</p>
                  {listing.partner.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                      {listing.partner.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
