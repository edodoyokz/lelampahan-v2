'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: {
    confirm: {
      label: string;
      variant: ButtonProps['variant'];
      onClick: () => void;
    };
    cancel?: { label: string; onClick?: () => void };
  };
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
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
    },
    [getFocusableElements]
  );

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      trapFocus(e);
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element inside the dialog
    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose, trapFocus, getFocusableElements]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-auto p-6 z-10"
      >
        <h2
          id="modal-title"
          className="text-lg font-semibold text-gray-900"
        >
          {title}
        </h2>

        {description && (
          <p
            id="modal-description"
            className="mt-2 text-sm text-gray-500"
          >
            {description}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        {actions && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {actions.cancel && (
              <Button
                variant="ghost"
                onClick={actions.cancel.onClick ?? onClose}
              >
                {actions.cancel.label}
              </Button>
            )}
            <Button
              variant={actions.confirm.variant}
              onClick={actions.confirm.onClick}
            >
              {actions.confirm.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
