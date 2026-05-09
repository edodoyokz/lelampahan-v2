import { describe, expect, it } from 'vitest';
import { filterByType, sortByNewest } from '@/domain/listing/search';
import { ListingData } from '@/domain/listing/service';

function makeListing(overrides: Partial<ListingData>): ListingData {
  return {
    title: 'Test',
    slug: 'test',
    type: 'TOUR',
    description: 'A test listing.',
    bookingMode: 'INSTANT_CONFIRMATION',
    partnerId: 'p1',
    timezone: 'Asia/Jakarta',
    status: 'PUBLISHED',
    ...overrides,
  };
}

describe('listing search', () => {
  it('filters listings by type', () => {
    const tours = [
      makeListing({ title: 'A', type: 'TOUR' }),
      makeListing({ title: 'B', type: 'EVENT' }),
    ];
    const result = filterByType(tours, 'TOUR');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('A');
  });

  it('sorts by newest first', () => {
    const listings = [
      makeListing({ title: 'Second' }),
      makeListing({ title: 'First' }),
    ];
    const sorted = sortByNewest(listings);
    expect(sorted[0].title).toBe('First');
    expect(sorted[1].title).toBe('Second');
  });
});
