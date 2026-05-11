import { ReviewStatus } from '@prisma/client';
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
      images: input.coverImage
        ? {
            create: {
              key: input.coverImage.key,
              url: input.coverImage.url,
              alt: input.coverImage.alt,
              mimeType: input.coverImage.mimeType,
              sizeBytes: input.coverImage.sizeBytes,
              width: input.coverImage.width,
              height: input.coverImage.height,
              isCover: true,
              sortOrder: 0,
            },
          }
        : undefined,
      sessions: input.sessions
        ? {
            create: input.sessions.map((session) => {
              const startsAt = new Date(session.startsAt);
              return {
                startsAt,
                endsAt: new Date(session.endsAt),
                bookingCutoff: startsAt,
                capacity: session.capacity,
                ticketTypes: {
                  create: {
                    name: session.ticketTypeName,
                    price: session.price,
                    quota: session.capacity,
                  },
                },
              };
            }),
          }
        : undefined,
    },
    include: { tourDetail: true, eventDetail: true, images: true, sessions: true },
  });

  return listing;
}

export async function findListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      partner: true,
      tourDetail: true,
      eventDetail: true,
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      sessions: {
        include: { ticketTypes: true },
        orderBy: { startsAt: 'asc' },
      },
    },
  });
}

export async function findListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      partner: true,
      tourDetail: true,
      eventDetail: true,
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      sessions: {
        where: { status: 'PUBLISHED' },
        include: { ticketTypes: { where: { active: true } } },
        orderBy: { startsAt: 'asc' },
      },
    },
  });
}

export async function listPublishedListings() {
  return prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      partner: true,
      eventDetail: true,
      tourDetail: true,
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      sessions: { where: { status: 'PUBLISHED' }, include: { ticketTypes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function searchPublishedListingsInDb(input: { q?: string | null; type?: string | null }) {
  const q = input.q?.trim();

  return prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      ...(input.type ? { type: input.type as any } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      partner: true,
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      sessions: { where: { status: 'PUBLISHED' }, include: { ticketTypes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listListingsForAdmin(status?: string, page?: number, pageSize?: number, q?: string) {
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const query = q?.trim();
  const where = {
    ...(status ? { status: status as ReviewStatus } : {}),
    ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
  };
  const normalizedWhere = Object.keys(where).length > 0 ? where : undefined;
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: normalizedWhere,
      include: { partner: true, _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.listing.count({
      where: normalizedWhere,
    }),
  ]);
  return { listings, total };
}

export async function listListingsForPartner(partnerId: string, status?: string, page?: number, pageSize?: number) {
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const where = {
    partnerId,
    ...(status ? { status: status as ReviewStatus } : {}),
  };
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.listing.count({ where }),
  ]);
  return { listings, total };
}

export async function updateListingStatus(id: string, status: string) {
  return prisma.listing.update({
    where: { id },
    data: { status: status as ReviewStatus },
  });
}

export async function updateListingInDb(id: string, data: Record<string, unknown>) {
  const updateData: Record<string, unknown> = {};

  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.bookingMode) updateData.bookingMode = data.bookingMode;

  // If listing was published, set back to PENDING_REVIEW for re-review
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (existing?.status === 'PUBLISHED') {
    updateData.status = 'PENDING_REVIEW';
  }

  await prisma.listing.update({
    where: { id },
    data: updateData,
  });

  // Update tour details if provided
  if (data.tourDetails && (data.tourDetails as Record<string, unknown>).duration !== undefined) {
    const td = data.tourDetails as Record<string, unknown>;
    await prisma.tourDetail.upsert({
      where: { listingId: id },
      create: {
        listingId: id,
        duration: (td.duration as string) ?? undefined,
        meetingPoint: (td.meetingPoint as string) ?? undefined,
        itinerary: (td.itinerary as unknown) ?? undefined,
        included: (td.included as unknown) ?? undefined,
        excluded: (td.excluded as unknown) ?? undefined,
      },
      update: {
        duration: (td.duration as string) ?? undefined,
        meetingPoint: (td.meetingPoint as string) ?? undefined,
        itinerary: (td.itinerary as unknown) ?? undefined,
        included: (td.included as unknown) ?? undefined,
        excluded: (td.excluded as unknown) ?? undefined,
      },
    });
  }

  // Update event details if provided
  if (data.eventDetails && (data.eventDetails as Record<string, unknown>).venue !== undefined) {
    const ed = data.eventDetails as Record<string, unknown>;
    await prisma.eventDetail.upsert({
      where: { listingId: id },
      create: {
        listingId: id,
        venue: (ed.venue as string) ?? undefined,
      },
      update: {
        venue: (ed.venue as string) ?? undefined,
      },
    });
  }

  // Replace sessions if provided by edit form.
  if (Array.isArray(data.sessions)) {
    await prisma.session.deleteMany({ where: { listingId: id } });
    for (const session of data.sessions as Array<{
      startsAt: string;
      endsAt: string;
      capacity: number;
      ticketTypeName: string;
      price: number;
    }>) {
      const startsAt = new Date(session.startsAt);
      await prisma.session.create({
        data: {
          listingId: id,
          startsAt,
          endsAt: new Date(session.endsAt),
          bookingCutoff: startsAt,
          capacity: session.capacity,
          ticketTypes: {
            create: {
              name: session.ticketTypeName,
              price: session.price,
              quota: session.capacity,
            },
          },
        },
      });
    }
  }

  // Handle cover image replacement
  if (data.coverImage) {
    const img = data.coverImage as {
      key: string;
      url: string;
      mimeType: string;
      sizeBytes: number;
      alt?: string;
    };
    // Delete existing cover images
    await prisma.listingImage.deleteMany({
      where: { listingId: id, isCover: true },
    });
    // Create new cover image
    await prisma.listingImage.create({
      data: {
        listingId: id,
        key: img.key,
        url: img.url,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        alt: img.alt,
        isCover: true,
        sortOrder: 0,
      },
    });
  }

  return findListingById(id);
}
