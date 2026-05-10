import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {illustration && (
        <div className="flex justify-center mb-4">{illustration}</div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="primary" size="md">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
