export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<StatusBadgeProps['status'], string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
};

const sizeStyles: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${statusStyles[status]} ${sizeStyles[size]}`}
    >
      {label}
    </span>
  );
}

/**
 * Maps business status strings to StatusBadge color variants.
 */
export type BusinessStatus =
  | 'PUBLISHED'
  | 'PENDING_REVIEW'
  | 'DRAFT'
  | 'REJECTED'
  | 'APPROVED'
  | 'REQUESTED'
  | 'PAID'
  | 'EXPIRED';

const businessStatusMap: Record<BusinessStatus, StatusBadgeProps['status']> = {
  PUBLISHED: 'success',
  PENDING_REVIEW: 'warning',
  DRAFT: 'neutral',
  REJECTED: 'error',
  APPROVED: 'success',
  REQUESTED: 'info',
  PAID: 'success',
  EXPIRED: 'error',
};

/**
 * Returns the StatusBadge color variant for a given business status.
 * Falls back to 'neutral' for unknown statuses.
 */
export function getStatusVariant(status: string): StatusBadgeProps['status'] {
  return businessStatusMap[status as BusinessStatus] ?? 'neutral';
}
