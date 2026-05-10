import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listingFindMany: vi.fn(),
  listingCreate: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    listing: {
      findMany: mocks.listingFindMany,
      create: mocks.listingCreate,
    },
  },
}));

import { createListingInDb } from '@/data/listing';

describe('listing images persistence', () => {
  it('creates a cover image when listing input includes coverImage', async () => {
    mocks.listingFindMany.mockResolvedValueOnce([]);
    mocks.listingCreate.mockResolvedValueOnce({ id: 'listing-1' });

    await createListingInDb({
      title: 'Jelajah Sungai Code',
      type: 'TOUR',
      description: 'Pengalaman berjalan kaki di sekitar Sungai Code.',
      bookingMode: 'INSTANT_CONFIRMATION',
      partnerId: 'partner-1',
      timezone: 'Asia/Jakarta',
      tourDetails: { duration: '2 jam' },
      coverImage: {
        key: 'listings/tmp/cover.webp',
        url: 'https://cdn.example.com/listings/tmp/cover.webp',
        alt: 'Jelajah Sungai Code',
        mimeType: 'image/webp',
        sizeBytes: 1234,
      },
    });

    expect(mocks.listingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          images: {
            create: expect.objectContaining({
              key: 'listings/tmp/cover.webp',
              url: 'https://cdn.example.com/listings/tmp/cover.webp',
              isCover: true,
              sortOrder: 0,
              mimeType: 'image/webp',
              sizeBytes: 1234,
            }),
          },
        }),
        include: expect.objectContaining({ images: true }),
      }),
    );
  });
});
