import { prisma } from '@/db/prisma';
import { TourListingInput } from '@/domain/listing/validation';
import { createListingDraft } from '@/domain/listing/service';

export async function createListingInDb(input: TourListingInput) {
  const existingSlugs = (await prisma.listing.findMany({ select: { slug: true } })).map(
    (l) => l.slug,
  );
  const listingData = createListingDraft({ input, existingSlugs });

  const listing = await prisma.listing.create({
    data: {
      title: listingData.title,
      slug: listingData.slug,
      type: listingData.type,
      description: listingData.description,
      bookingMode: listingData.bookingMode,
      partnerId: listingData.partnerId,
      timezone: listingData.timezone,
      status: listingData.status,
      tourDetail: input.tourDetails
        ? {
            create: {
              duration: input.tourDetails.duration,
              itinerary: input.tourDetails.itinerary ?? undefined,
              included: input.tourDetails.included ?? undefined,
              excluded: input.tourDetails.excluded ?? undefined,
              meetingPoint: input.tourDetails.meetingPoint,
            },
          }
        : undefined,
      eventDetail: input.eventDetails
        ? {
            create: {
              venue: input.eventDetails.venue,
              gateNotes: input.eventDetails.gateNotes,
            },
          }
        : undefined,
    },
    include: { tourDetail: true, eventDetail: true },
  });

  return listing;
}

export async function findListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { tourDetail: true, eventDetail: true, sessions: true },
  });
}

export async function findListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      tourDetail: true,
      eventDetail: true,
      sessions: { where: { status: 'PUBLISHED' } },
    },
  });
}

export async function listPublishedListings() {
  return prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateListingStatus(id: string, status: string) {
  return prisma.listing.update({
    where: { id },
    data: { status: status as any },
  });
}
