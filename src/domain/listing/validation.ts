import { z } from 'zod';

export const itineraryItemSchema = z.object({
  time: z.string(),
  activity: z.string(),
});

export const tourDetailSchema = z.object({
  duration: z.string().optional(),
  itinerary: z.array(itineraryItemSchema).optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  meetingPoint: z.string().optional(),
});

export const eventDetailSchema = z.object({
  venue: z.string().optional(),
  gateNotes: z.string().optional(),
});

export const listingSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(['TOUR', 'EVENT']),
  description: z.string().min(10).max(5000),
  bookingMode: z.enum(['INSTANT_CONFIRMATION', 'REQUEST_TO_BOOK']),
  partnerId: z.string().min(1),
  timezone: z.string().default('Asia/Jakarta'),
  tourDetails: tourDetailSchema.optional(),
  eventDetails: eventDetailSchema.optional(),
});

export type TourListingInput = z.infer<typeof listingSchema>;

export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
export type ListingType = 'TOUR' | 'EVENT';
export type BookingMode = 'INSTANT_CONFIRMATION' | 'REQUEST_TO_BOOK';
