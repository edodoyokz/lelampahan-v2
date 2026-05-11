'use client';

import { useState, useMemo } from 'react';
import { HeroSection } from '@/components/feature/hero-section';
import { CategoryBrowser, type Category } from '@/components/feature/category-browser';
import { ListingCard, type ListingCardProps } from '@/components/feature/listing-card';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarDays, Compass, LayoutGrid, Search } from 'lucide-react';

const categories: Category[] = [
  { label: 'Semua', value: '', icon: <LayoutGrid className="h-5 w-5" strokeWidth={1.8} /> },
  { label: 'Tur', value: 'TOUR', icon: <Compass className="h-5 w-5" strokeWidth={1.8} /> },
  { label: 'Acara', value: 'EVENT', icon: <CalendarDays className="h-5 w-5" strokeWidth={1.8} /> },
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
      <section id="explore" className="mt-8 scroll-mt-24" aria-label="Kategori">
        <CategoryBrowser
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </section>

      {/* Pengalaman Grid */}
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
              <Search className="h-12 w-12 text-gray-400" strokeWidth={1.6} aria-hidden="true" />
            }
            title="Belum ketemu pengalaman yang cocok"
            description={
              searchQuery || activeCategory
                ? 'Coba kata kunci lain atau lihat semua kategori yang tersedia.'
                : 'Belum ada pengalaman yang tersedia saat ini.'
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
