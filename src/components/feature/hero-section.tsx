"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  onSearch: (query: string) => void;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-lelampahan-cream to-lelampahan-gold/10">
      {/* Subtle batik SVG pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="batik-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              {/* Diamond/kawung motif */}
              <path
                d="M30 5 L55 30 L30 55 L5 30 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="30" cy="12" r="3" fill="currentColor" />
              <circle cx="30" cy="48" r="3" fill="currentColor" />
              <circle cx="12" cy="30" r="3" fill="currentColor" />
              <circle cx="48" cy="30" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#batik-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-lelampahan-earth">
          Rasakan Jogja Lewat Pengalaman Lokal
        </h1>
        <p className="mt-3 text-base md:text-lg text-lelampahan-earth/70">
          Temukan tur, workshop, dan acara lokal terkurasi. Pesan online, bayar mudah dengan QRIS.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 mx-auto flex max-w-xl items-end gap-2"
        >
          <div className="flex-1">
            <Input
              label=""
              placeholder="Cari Kotagede, batik, kuliner, Prambanan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari listing"
            />
          </div>
          <Button variant="primary" size="md" type="submit">
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cari</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
