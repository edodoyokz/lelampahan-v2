'use client';

import { useState, useMemo } from 'react';
import { HeroSection } from '@/components/feature/hero-section';
import { CategoryBrowser, type Category } from '@/components/feature/category-browser';
import { ListingCard, type ListingCardProps } from '@/components/feature/listing-card';
import { EmptyState } from '@/components/ui/empty-state';

const categories: Category[] = [
  { label: 'Semua', value: '', icon: '🏠' },
  { label: 'Tour', value: 'TOUR', icon: '🗺️' },
  { label: 'Event', value: 'EVENT', icon: '🎉' },
];

interface MarketplaceHomepageContentProps {
  listings: ListingCardProps[];
}

export function MarketplaceHomepageContent({ listings }: MarketplaceHomepageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const filteredListings = useMemo(() => {
    let result = listings;

    if (activeCategory) {
      result = result.filter((l) => l.type === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.partnerName.toLowerCase().includes(q) ||
          (l.location && l.location.toLowerCase().includes(q))
      );
    }

    return result;
  }, [listings, activeCategory, searchQuery]);

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  function handleCategorySelect(value: string) {
    setActiveCategory(value);
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Category Browser */}
      <section className="mt-8" aria-label="Kategori">
        <CategoryBrowser
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </section>

      {/* Listings Grid */}
      <section className="mt-8" aria-label="Daftar listing">
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.slug} {...listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            illustration={
              <span className="text-5xl" role="img" aria-label="Tidak ada listing">
                🔍
              </span>
            }
            title="Tidak ada listing ditemukan"
            description={
              searchQuery || activeCategory
                ? 'Coba ubah kata kunci pencarian atau kategori yang dipilih.'
                : 'Belum ada listing yang tersedia saat ini.'
            }
            action={
              searchQuery || activeCategory
                ? {
                    label: 'Reset Filter',
                    onClick: () => {
                      setSearchQuery('');
                      setActiveCategory('');
                    },
                  }
                : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
