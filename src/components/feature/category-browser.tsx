'use client';

import React from 'react';

export interface Category {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export interface CategoryBrowserProps {
  categories: Category[];
  activeCategory?: string;
  onSelect: (value: string) => void;
}

export function CategoryBrowser({
  categories,
  activeCategory,
  onSelect,
}: CategoryBrowserProps) {
  return (
    <div
      className="
        flex gap-3 overflow-x-auto pb-2 scrollbar-none
        md:grid md:grid-cols-4 md:gap-4 md:overflow-x-visible md:pb-0
      "
      role="listbox"
      aria-label="Kategori listing"
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.value;

        return (
          <button
            key={category.value}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onSelect(category.value)}
            className={`
              flex flex-col items-center gap-2
              min-w-[5rem] px-4 py-3
              rounded-xl border-2 transition-colors duration-150
              cursor-pointer shrink-0
              focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50
              ${
                isActive
                  ? 'border-lelampahan-gold bg-lelampahan-cream'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `.trim()}
          >
            <span className={isActive ? 'text-lelampahan-gold' : 'text-gray-500'} aria-hidden="true">
              {category.icon}
            </span>
            <span
              className={`text-sm font-medium whitespace-nowrap ${
                isActive ? 'text-lelampahan-earth' : 'text-gray-700'
              }`}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
