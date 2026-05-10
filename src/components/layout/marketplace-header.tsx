'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileDrawer } from '@/components/ui/mobile-drawer';

export interface MarketplaceHeaderProps {
  user?: { name: string; avatarUrl?: string } | null;
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Jelajahi', href: '/' },
  { label: 'Akun Saya', href: '/account' },
];

export function MarketplaceHeader({ user }: MarketplaceHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-lelampahan-gold/20 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-lelampahan-earth"
        >
          Lelampahan
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-lelampahan-brick hover:text-lelampahan-earth transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / User */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lelampahan-gold text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-lelampahan-earth">
                {user.name}
              </span>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center p-2 rounded-md text-lelampahan-earth hover:bg-lelampahan-cream transition-colors"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu navigasi"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} position="left">
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <span className="text-lg font-bold text-lelampahan-earth">
              Lelampahan
            </span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Tutup menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Drawer Navigation */}
          <div className="flex flex-col gap-1 px-3 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-lelampahan-brick hover:bg-lelampahan-cream hover:text-lelampahan-earth transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Drawer Auth / User */}
          <div className="mt-auto border-t border-gray-200 px-4 py-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lelampahan-gold text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-lelampahan-earth">
                  {user.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setDrawerOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setDrawerOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </MobileDrawer>
    </header>
  );
}
