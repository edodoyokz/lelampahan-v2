/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  describe('color mapping for each status variant', () => {
    it('renders success variant with green styling', () => {
      render(<StatusBadge status="success" label="Active" />);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders warning variant with yellow styling', () => {
      render(<StatusBadge status="warning" label="Pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders error variant with red styling', () => {
      render(<StatusBadge status="error" label="Rejected" />);
      const badge = screen.getByText('Rejected');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders info variant with blue styling', () => {
      render(<StatusBadge status="info" label="Requested" />);
      const badge = screen.getByText('Requested');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders neutral variant with gray styling', () => {
      render(<StatusBadge status="neutral" label="Draft" />);
      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders sm size by default', () => {
      render(<StatusBadge status="success" label="Small" />);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');
    });

    it('renders md size when specified', () => {
      render(<StatusBadge status="success" label="Medium" size="md" />);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('text-sm', 'px-2.5', 'py-1');
    });

    it('renders as a span with rounded-full and font-medium', () => {
      render(<StatusBadge status="info" label="Badge" />);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'font-medium', 'rounded-full');
    });
  });

  describe('getStatusVariant - business status helper function mapping', () => {
    it('maps PUBLISHED to success', () => {
      expect(getStatusVariant('PUBLISHED')).toBe('success');
    });

    it('maps PENDING_REVIEW to warning', () => {
      expect(getStatusVariant('PENDING_REVIEW')).toBe('warning');
    });

    it('maps DRAFT to neutral', () => {
      expect(getStatusVariant('DRAFT')).toBe('neutral');
    });

    it('maps REJECTED to error', () => {
      expect(getStatusVariant('REJECTED')).toBe('error');
    });

    it('maps APPROVED to success', () => {
      expect(getStatusVariant('APPROVED')).toBe('success');
    });

    it('maps REQUESTED to info', () => {
      expect(getStatusVariant('REQUESTED')).toBe('info');
    });

    it('maps PAID to success', () => {
      expect(getStatusVariant('PAID')).toBe('success');
    });

    it('maps EXPIRED to error', () => {
      expect(getStatusVariant('EXPIRED')).toBe('error');
    });

    it('falls back to neutral for unknown statuses', () => {
      expect(getStatusVariant('UNKNOWN')).toBe('neutral');
      expect(getStatusVariant('SOMETHING_ELSE')).toBe('neutral');
      expect(getStatusVariant('')).toBe('neutral');
    });
  });
});
