import { describe, expect, it } from 'vitest';
import { generateSlug, makeSlug } from '@/config/slug';

describe('generateSlug', () => {
  it('converts a title to a url-safe slug', () => {
    expect(generateSlug('Jelajah Kotagede Heritage')).toBe('jelajah-kotagede-heritage');
  });

  it('strips special characters and collapses dashes', () => {
    expect(generateSlug('Tour & Travel: Jogja!')).toBe('tour-travel-jogja');
  });
});

describe('makeSlug', () => {
  it('appends a short random suffix when base is taken', () => {
    const taken = ['jelajah-kotagede-heritage'];
    const slug = makeSlug('Jelajah Kotagede Heritage', taken);
    expect(slug).toMatch(/^jelajah-kotagede-heritage-[a-z0-9]{4}$/);
  });

  it('returns the base slug when not taken', () => {
    expect(makeSlug('Jelajah Kotagede Heritage', [])).toBe('jelajah-kotagede-heritage');
  });
});
