'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarNavigationProps {
  items: NavItem[];
  currentPath: string;
  title?: string;
  /** Mobile variant: 'bottom-nav' for partner portal, 'drawer' for admin backoffice */
  mobileVariant?: 'bottom-nav' | 'drawer';
}

export function SidebarNavigation({
  items,
  currentPath,
  title,
  mobileVariant = 'bottom-nav',
}: SidebarNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Focus trap + Escape key for the drawer
  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element when drawer opens
    const timer = setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('button, [href]')?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [drawerOpen, closeDrawer]);

  function isActive(href: string): boolean {
    if (href === currentPath) return true;
    // Match exact path or sub-paths (e.g. /partner matches /partner but not /partner/listings)
    // For root paths like /partner or /admin, only match exactly
    if (href.split('/').length <= 2) return currentPath === href;
    return currentPath.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0" aria-label="Sidebar navigation">
        {title && (
          <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </h2>
        )}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150
                  ${
                    active
                      ? 'bg-lelampahan-cream text-lelampahan-earth font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `.trim()}
                aria-current={active ? 'page' : undefined}
              >
                <span className="h-5 w-5 shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: Bottom navigation bar */}
      {mobileVariant === 'bottom-nav' && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t bg-white px-2 py-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors duration-150
                  ${
                    active
                      ? 'text-lelampahan-earth font-semibold'
                      : 'text-gray-500'
                  }
                `.trim()}
                aria-current={active ? 'page' : undefined}
              >
                <span className="h-5 w-5" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile: Collapsible drawer */}
      {mobileVariant === 'drawer' && (
        <>
          {/* Hamburger toggle button */}
          <button
            type="button"
            className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-lelampahan-gold text-white shadow-lg md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Drawer overlay and panel */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 animate-fade-in"
                onClick={closeDrawer}
                aria-hidden="true"
              />

              {/* Drawer panel */}
              <div
                ref={drawerRef}
                className="fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-lg overflow-y-auto animate-slide-in-left"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  {title && (
                    <span className="text-sm font-semibold text-lelampahan-earth">
                      {title}
                    </span>
                  )}
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    onClick={closeDrawer}
                    aria-label="Close navigation menu"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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

                <nav className="flex flex-col gap-1 p-3">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150
                          ${
                            active
                              ? 'bg-lelampahan-cream text-lelampahan-earth font-semibold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }
                        `.trim()}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => { closeDrawer(); }}
                      >
                        <span className="h-5 w-5 shrink-0" aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
