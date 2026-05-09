import { describe, expect, it } from 'vitest';
import {
  createListingDraft,
  submitListingForReview,
  approveListing,
} from '@/domain/listing/service';
import { TourListingInput } from '@/domain/listing/validation';

const validTour: TourListingInput = {
  title: 'Jelajah Kotagede Heritage',
  type: 'TOUR',
  description: 'Tur budaya menyusuri Kotagede.',
  bookingMode: 'INSTANT_CONFIRMATION',
  partnerId: 'p1',
  timezone: 'Asia/Jakarta',
  tourDetails: {
    duration: '4 jam',
    itinerary: [
      { time: '08:00', activity: 'Meetup di Pasar Kotagede' },
      { time: '09:00', activity: 'Menyusuri sentra perak' },
    ],
  },
};

describe('listing service', () => {
  it('creates a tour listing draft', () => {
    const listing = createListingDraft({ input: validTour, existingSlugs: [] });
    expect(listing.title).toBe('Jelajah Kotagede Heritage');
    expect(listing.slug).toBe('jelajah-kotagede-heritage');
    expect(listing.status).toBe('DRAFT');
    expect(listing.type).toBe('TOUR');
  });

  it('submits a draft listing for review', () => {
    const draft = createListingDraft({ input: validTour, existingSlugs: [] });
    const submitted = submitListingForReview(draft);
    expect(submitted.status).toBe('PENDING_REVIEW');
  });

  it('approves a pending listing', () => {
    const draft = createListingDraft({ input: validTour, existingSlugs: [] });
    const submitted = submitListingForReview(draft);
    const approved = approveListing(submitted);
    expect(approved.status).toBe('PUBLISHED');
  });

  it('rejects submission of a non-draft listing', () => {
    const draft = createListingDraft({ input: validTour, existingSlugs: [] });
    const submitted = submitListingForReview(draft);
    expect(() => submitListingForReview(submitted)).toThrow('Only draft listings can be submitted');
  });
});
