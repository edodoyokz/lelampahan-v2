'use client';

import React from 'react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState, type EmptyStateProps } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: EmptyStateProps;
  mobileCardRender?: (item: T) => React.ReactNode;
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items (for server-side pagination) */
  totalItems?: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
}

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonLoader key={i} variant="table-row" />
      ))}
    </div>
  );
}

function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="text-sm text-gray-500">
        Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)} dari {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-gray-600">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  mobileCardRender,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title ?? 'Tidak ada data'}
        description={emptyState?.description}
        illustration={emptyState?.illustration}
        action={emptyState?.action}
      />
    );
  }

  const showPagination = page !== undefined && pageSize !== undefined && totalItems !== undefined && onPageChange;

  return (
    <>
      {/* Desktop table view (≥768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list view (<768px) */}
      <div className="md:hidden space-y-3">
        {mobileCardRender
          ? data.map((item, index) => (
              <div key={index}>{mobileCardRender(item)}</div>
            ))
          : data.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-2"
              >
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => (
                    <div key={col.key} className="flex justify-between items-start gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        {col.header}
                      </span>
                      <span className="text-sm text-gray-900 text-right">
                        {col.render(item)}
                      </span>
                    </div>
                  ))}
              </div>
            ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
