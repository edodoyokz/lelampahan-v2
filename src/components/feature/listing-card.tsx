import Link from 'next/link';
import Image from 'next/image';
import { formatIDR } from '@/lib/format-currency';

export interface ListingCardProps {
  slug: string;
  title: string;
  type: 'TOUR' | 'EVENT';
  location?: string;
  imageUrl?: string;
  priceFrom?: number;
  partnerName: string;
  sessionsCount: number;
}

export function ListingCard({
  slug,
  title,
  type,
  location,
  imageUrl,
  priceFrom,
  partnerName,
  sessionsCount,
}: ListingCardProps) {
  const typeBadgeLabel = type === 'TOUR' ? 'Tur' : 'Acara';

  return (
    <Link
      href={`/l/${slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image section with 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lelampahan-cream to-gray-100">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}

        {/* Type badge overlay */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-lelampahan-brick shadow-sm backdrop-blur-sm">
          {typeBadgeLabel}
        </span>
      </div>

      {/* Content section */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-lelampahan-earth line-clamp-2">
          {title}
        </h3>

        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="truncate">{location}</span>
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {partnerName} · {sessionsCount} sesi
          </span>
          <span className="text-sm font-semibold text-lelampahan-brick">
            {priceFrom != null ? formatIDR(priceFrom) : 'Lihat detail'}
          </span>
        </div>
      </div>
    </Link>
  );
}
