import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listingFindUnique: vi.fn(),
  listingUpdate: vi.fn(),
  tourDetailUpsert: vi.fn(),
  eventDetailUpsert: vi.fn(),
  listingImageDeleteMany: vi.fn(),
  listingImageCreate: vi.fn(),
  sessionDeleteMany: vi.fn(),
  sessionCreate: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    listing: {
      findUnique: mocks.listingFindUnique,
      update: mocks.listingUpdate,
    },
    tourDetail: { upsert: mocks.tourDetailUpsert },
    eventDetail: { upsert: mocks.eventDetailUpsert },
    listingImage: {
      deleteMany: mocks.listingImageDeleteMany,
      create: mocks.listingImageCreate,
    },
    session: {
      deleteMany: mocks.sessionDeleteMany,
      create: mocks.sessionCreate,
    },
  },
}));

import { findListingById, updateListingInDb } from '@/data/listing';

describe('listing edit persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listingUpdate.mockResolvedValue({ id: 'listing-1' });
    mocks.listingFindUnique.mockResolvedValue({ id: 'listing-1', status: 'PUBLISHED' });
  });

  it('loads images and ticket types needed by edit form', async () => {
    mocks.listingFindUnique.mockResolvedValueOnce({ id: 'listing-1' });

    await findListingById('listing-1');

    expect(mocks.listingFindUnique).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
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
  });

  it('persists included/excluded inside tour details and resets published listing for review', async () => {
    await updateListingInDb('listing-1', {
      title: 'Updated',
      tourDetails: {
        duration: '3 jam',
        meetingPoint: 'Alun-alun',
        itinerary: [{ time: '08:00', activity: 'Mulai' }],
        included: ['Guide'],
        excluded: ['Transport'],
      },
    });

    expect(mocks.listingUpdate).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      data: { title: 'Updated', status: 'PENDING_REVIEW' },
    });
    expect(mocks.tourDetailUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          included: ['Guide'],
          excluded: ['Transport'],
        }),
      }),
    );
  });

  it('replaces sessions transactionally for edit payload sessions', async () => {
    await updateListingInDb('listing-1', {
      sessions: [
        {
          startsAt: '2026-06-01T08:00',
          endsAt: '2026-06-01T10:00',
          capacity: 12,
          ticketTypeName: 'Regular',
          price: 75000,
        },
      ],
    });

    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({ where: { listingId: 'listing-1' } });
    expect(mocks.sessionCreate).toHaveBeenCalledWith({
      data: {
        listingId: 'listing-1',
        startsAt: new Date('2026-06-01T08:00'),
        endsAt: new Date('2026-06-01T10:00'),
        bookingCutoff: new Date('2026-06-01T08:00'),
        capacity: 12,
        ticketTypes: {
          create: {
            name: 'Regular',
            price: 75000,
            quota: 12,
          },
        },
      },
    });
  });
});
