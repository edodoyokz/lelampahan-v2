import { TourListingInput, ListingStatus, ListingType, BookingMode } from './validation';
import { makeSlug } from '@/config/slug';

export interface ListingData {
  id?: string;
  title: string;
  slug: string;
  type: ListingType;
  description: string;
  bookingMode: BookingMode;
  partnerId: string;
  timezone: string;
  status: ListingStatus;
}

export function createListingDraft(input: { input: TourListingInput; existingSlugs: string[] }): ListingData {
  const slug = makeSlug(input.input.title, input.existingSlugs);

  return {
    title: input.input.title,
    slug,
    type: input.input.type,
    description: input.input.description,
    bookingMode: input.input.bookingMode,
    partnerId: input.input.partnerId,
    timezone: input.input.timezone || 'Asia/Jakarta',
    status: 'DRAFT',
  };
}

export function submitListingForReview(listing: ListingData): ListingData {
  if (listing.status !== 'DRAFT') {
    throw new Error('Only draft listings can be submitted for review');
  }
  return { ...listing, status: 'PENDING_REVIEW' };
}

export function approveListing(listing: ListingData): ListingData {
  if (listing.status !== 'PENDING_REVIEW') {
    throw new Error('Only pending listings can be approved');
  }
  return { ...listing, status: 'PUBLISHED' };
}

export function rejectListing(listing: ListingData): ListingData {
  if (listing.status !== 'PENDING_REVIEW') {
    throw new Error('Only pending listings can be rejected');
  }
  return { ...listing, status: 'REJECTED' };
}
