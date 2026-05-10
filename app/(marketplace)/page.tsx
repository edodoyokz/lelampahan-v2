import { Suspense } from 'react';
import { listPublishedListings } from '@/data/listing';
import { MarketplaceHomepageContent } from './homepage-content';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

interface PublishedListingForHome {
  id: string;
  slug: string;
  title: string;
  type: string;
  eventDetail?: { venue: string | null } | null;
  partner: { name: string };
  sessions: Array<{
    ticketTypes: Array<{ price: number }>;
  }>;
  images?: Array<{ url: string; isCover: boolean; sortOrder: number }>;
}

function ListingsGridSkeleton() {
  return (
    <div className="py-10">
      {/* Hero skeleton */}
      <div className="mb-8 h-48 animate-pulse rounded-xl bg-gray-200" />
      {/* Category skeleton */}
      <div className="mb-8 flex gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-16 w-20 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}

async function ListingsContent() {
  let listings: Awaited<ReturnType<typeof listPublishedListings>> = [];
  try {
    listings = await listPublishedListings();
  } catch {
    // Return empty listings on error
  }

  const mappedListings = (listings as PublishedListingForHome[]).map((listing) => {
    const firstTicketType = listing.sessions[0]?.ticketTypes[0];
    const coverImage = listing.images?.find((image) => image.isCover) ?? listing.images?.[0];
    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      type: listing.type as 'TOUR' | 'EVENT',
      location: listing.eventDetail?.venue ?? undefined,
      imageUrl: coverImage?.url,
      priceFrom: firstTicketType?.price ?? undefined,
      partnerName: listing.partner.name,
      sessionsCount: listing.sessions.length,
    };
  });

  return <MarketplaceHomepageContent listings={mappedListings} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<ListingsGridSkeleton />}>
      <ListingsContent />
    </Suspense>
  );
}
