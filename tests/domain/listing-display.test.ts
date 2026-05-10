import { describe, expect, it } from 'vitest';
import { normalizeItinerary, normalizeStringList } from '@/domain/listing/display';

describe('listing display normalizers', () => {
  it('normalizes structured itinerary items', () => {
    expect(
      normalizeItinerary([
        { time: '09.00', activity: 'Briefing' },
        { time: '', activity: 'Walking tour' },
        { time: '10.00', activity: '' },
      ]),
    ).toEqual([
      { time: '09.00', activity: 'Briefing' },
      { activity: 'Walking tour' },
    ]);
  });

  it('normalizes string itinerary lines', () => {
    expect(normalizeItinerary('Briefing\nWalking tour')).toEqual([
      { activity: 'Briefing' },
      { activity: 'Walking tour' },
    ]);
  });

  it('normalizes JSON string arrays', () => {
    expect(normalizeStringList('["Guide", "Snack"]')).toEqual(['Guide', 'Snack']);
  });

  it('normalizes comma separated string lists', () => {
    expect(normalizeStringList('Guide, Snack, Ticket')).toEqual(['Guide', 'Snack', 'Ticket']);
  });
});
