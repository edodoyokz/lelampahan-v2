/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

describe('SkeletonLoader', () => {
  describe('text variant', () => {
    it('renders default 3 lines', () => {
      render(<SkeletonLoader variant="text" />);
      const container = screen.getByRole('status', { name: 'Loading text' });
      const lines = container.querySelectorAll('div.animate-pulse');
      expect(lines).toHaveLength(3);
    });

    it('respects custom lines prop', () => {
      render(<SkeletonLoader variant="text" lines={5} />);
      const container = screen.getByRole('status', { name: 'Loading text' });
      const lines = container.querySelectorAll('div.animate-pulse');
      expect(lines).toHaveLength(5);
    });

    it('renders single line when lines is 1', () => {
      render(<SkeletonLoader variant="text" lines={1} />);
      const container = screen.getByRole('status', { name: 'Loading text' });
      const lines = container.querySelectorAll('div.animate-pulse');
      expect(lines).toHaveLength(1);
    });

    it('has animate-pulse class on each line', () => {
      render(<SkeletonLoader variant="text" lines={2} />);
      const container = screen.getByRole('status', { name: 'Loading text' });
      const lines = container.querySelectorAll('div');
      lines.forEach((line) => {
        expect(line).toHaveClass('animate-pulse');
      });
    });
  });

  describe('image variant', () => {
    it('renders with aspect-video class', () => {
      render(<SkeletonLoader variant="image" />);
      const element = screen.getByRole('status', { name: 'Loading image' });
      expect(element).toHaveClass('aspect-video');
    });

    it('has animate-pulse class', () => {
      render(<SkeletonLoader variant="image" />);
      const element = screen.getByRole('status', { name: 'Loading image' });
      expect(element).toHaveClass('animate-pulse');
    });

    it('has bg-gray-200 background', () => {
      render(<SkeletonLoader variant="image" />);
      const element = screen.getByRole('status', { name: 'Loading image' });
      expect(element).toHaveClass('bg-gray-200');
    });
  });

  describe('card variant', () => {
    it('renders image and text combination', () => {
      render(<SkeletonLoader variant="card" />);
      const container = screen.getByRole('status', { name: 'Loading card' });
      // Card has an image placeholder (aspect-video) + text lines
      const imagePlaceholder = container.querySelector('.aspect-video');
      expect(imagePlaceholder).toBeInTheDocument();
      // Text lines below the image
      const textLines = container.querySelectorAll('.space-y-3 div');
      expect(textLines.length).toBeGreaterThan(0);
    });

    it('has animate-pulse class on child elements', () => {
      render(<SkeletonLoader variant="card" />);
      const container = screen.getByRole('status', { name: 'Loading card' });
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('table-row variant', () => {
    it('renders full-width bar', () => {
      render(<SkeletonLoader variant="table-row" />);
      const element = screen.getByRole('status', { name: 'Loading table row' });
      expect(element).toHaveClass('w-full');
    });

    it('has animate-pulse class', () => {
      render(<SkeletonLoader variant="table-row" />);
      const element = screen.getByRole('status', { name: 'Loading table row' });
      expect(element).toHaveClass('animate-pulse');
    });

    it('has correct height', () => {
      render(<SkeletonLoader variant="table-row" />);
      const element = screen.getByRole('status', { name: 'Loading table row' });
      expect(element).toHaveClass('h-10');
    });
  });

  describe('all variants have animate-pulse', () => {
    it('text variant has animate-pulse on lines', () => {
      render(<SkeletonLoader variant="text" />);
      const container = screen.getByRole('status', { name: 'Loading text' });
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it('image variant has animate-pulse', () => {
      render(<SkeletonLoader variant="image" />);
      const element = screen.getByRole('status', { name: 'Loading image' });
      expect(element).toHaveClass('animate-pulse');
    });

    it('card variant has animate-pulse', () => {
      render(<SkeletonLoader variant="card" />);
      const container = screen.getByRole('status', { name: 'Loading card' });
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it('table-row variant has animate-pulse', () => {
      render(<SkeletonLoader variant="table-row" />);
      const element = screen.getByRole('status', { name: 'Loading table row' });
      expect(element).toHaveClass('animate-pulse');
    });
  });
});
