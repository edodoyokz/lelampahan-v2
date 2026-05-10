'use client';

import React, { useEffect, useCallback } from 'react';

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function MobileDrawer({
  open,
  onClose,
  children,
  position = 'left',
}: MobileDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const slideFrom =
    position === 'left'
      ? 'left-0 animate-slide-in-left'
      : 'right-0 animate-slide-in-right';

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`
          fixed top-0 h-full
          w-72 max-w-[80vw]
          bg-white shadow-lg
          overflow-y-auto
          ${slideFrom}
        `.trim()}
      >
        {children}
      </div>
    </div>
  );
}
