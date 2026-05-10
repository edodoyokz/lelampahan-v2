import React from 'react';

export interface SkeletonProps {
  variant: 'text' | 'image' | 'card' | 'table-row';
  lines?: number;
  className?: string;
}

const textLineWidths = ['w-full', 'w-11/12', 'w-4/5', 'w-9/12', 'w-3/4'];

function TextSkeleton({ lines = 3, className = '' }: { lines: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading text">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse bg-gray-200 rounded ${textLineWidths[i % textLineWidths.length]}`}
        />
      ))}
    </div>
  );
}

function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`aspect-video animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Loading image"
    />
  );
}

function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading card">
      <div className="aspect-video animate-pulse bg-gray-200 rounded" />
      <div className="space-y-3">
        <div className="h-4 animate-pulse bg-gray-200 rounded w-3/4" />
        <div className="h-4 animate-pulse bg-gray-200 rounded w-1/2" />
        <div className="h-4 animate-pulse bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

function TableRowSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-10 animate-pulse bg-gray-200 rounded w-full ${className}`}
      role="status"
      aria-label="Loading table row"
    />
  );
}

export function SkeletonLoader({ variant, lines = 3, className = '' }: SkeletonProps) {
  switch (variant) {
    case 'text':
      return <TextSkeleton lines={lines} className={className} />;
    case 'image':
      return <ImageSkeleton className={className} />;
    case 'card':
      return <CardSkeleton className={className} />;
    case 'table-row':
      return <TableRowSkeleton className={className} />;
  }
}
