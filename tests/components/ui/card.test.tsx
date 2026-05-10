/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/card';

describe('Card', () => {
  describe('variant classes', () => {
    it('renders elevated variant with shadow', () => {
      render(<Card variant="elevated">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm');
      expect(card).not.toHaveClass('border');
    });

    it('renders outlined variant with border', () => {
      render(<Card variant="outlined">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'border', 'border-gray-200');
      expect(card).not.toHaveClass('shadow-sm');
    });
  });

  describe('padding sizes', () => {
    it('applies small padding (p-4)', () => {
      render(<Card variant="elevated" padding="sm">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('p-4');
    });

    it('applies medium padding (p-6) by default', () => {
      render(<Card variant="elevated">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('p-6');
    });

    it('applies large padding (p-8)', () => {
      render(<Card variant="elevated" padding="lg">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('p-8');
    });
  });

  describe('custom className', () => {
    it('appends custom className', () => {
      render(<Card variant="outlined" className="mt-4">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('mt-4');
    });
  });

  describe('children rendering', () => {
    it('renders children content', () => {
      render(
        <Card variant="elevated">
          <h2>Title</h2>
          <p>Description</p>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });
});
