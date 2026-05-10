// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryBrowser, Category } from '@/components/feature/category-browser';
import { CalendarDays, Compass, LayoutGrid } from 'lucide-react';

const categories: Category[] = [
  { label: 'Semua', value: '', icon: <LayoutGrid data-testid="icon-semua" /> },
  { label: 'Tour', value: 'TOUR', icon: <Compass data-testid="icon-tour" /> },
  { label: 'Event', value: 'EVENT', icon: <CalendarDays data-testid="icon-event" /> },
];

describe('CategoryBrowser', () => {
  describe('renders all categories', () => {
    it('renders all category labels', () => {
      render(<CategoryBrowser categories={categories} onSelect={() => {}} />);

      for (const category of categories) {
        expect(screen.getByText(category.label)).toBeInTheDocument();
      }
    });

    it('renders category icons', () => {
      render(<CategoryBrowser categories={categories} onSelect={() => {}} />);

      expect(screen.getByTestId('icon-semua')).toBeInTheDocument();
      expect(screen.getByTestId('icon-tour')).toBeInTheDocument();
      expect(screen.getByTestId('icon-event')).toBeInTheDocument();
    });

    it('renders a listbox with correct aria-label', () => {
      render(<CategoryBrowser categories={categories} onSelect={() => {}} />);

      expect(screen.getByRole('listbox', { name: 'Kategori listing' })).toBeInTheDocument();
    });
  });

  describe('active category highlighting', () => {
    it('active category has border-lelampahan-gold and bg-lelampahan-cream classes', () => {
      render(
        <CategoryBrowser categories={categories} activeCategory="TOUR" onSelect={() => {}} />
      );

      const activeOption = screen.getByRole('option', { name: /Tour/i });
      expect(activeOption).toHaveClass('border-lelampahan-gold');
      expect(activeOption).toHaveClass('bg-lelampahan-cream');
    });

    it('inactive categories have border-gray-200 and bg-white classes', () => {
      render(
        <CategoryBrowser categories={categories} activeCategory="TOUR" onSelect={() => {}} />
      );

      const semua = screen.getByRole('option', { name: /Semua/i });
      const event = screen.getByRole('option', { name: /Event/i });

      expect(semua).toHaveClass('border-gray-200');
      expect(semua).toHaveClass('bg-white');
      expect(event).toHaveClass('border-gray-200');
      expect(event).toHaveClass('bg-white');
    });

    it('active category has aria-selected="true"', () => {
      render(
        <CategoryBrowser categories={categories} activeCategory="TOUR" onSelect={() => {}} />
      );

      const activeOption = screen.getByRole('option', { name: /Tour/i });
      expect(activeOption).toHaveAttribute('aria-selected', 'true');
    });

    it('inactive categories have aria-selected="false"', () => {
      render(
        <CategoryBrowser categories={categories} activeCategory="TOUR" onSelect={() => {}} />
      );

      const semua = screen.getByRole('option', { name: /Semua/i });
      const event = screen.getByRole('option', { name: /Event/i });

      expect(semua).toHaveAttribute('aria-selected', 'false');
      expect(event).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('onSelect callback', () => {
    it('clicking a category calls onSelect with the correct value', () => {
      const onSelect = vi.fn();
      render(<CategoryBrowser categories={categories} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('option', { name: /Tour/i }));
      expect(onSelect).toHaveBeenCalledWith('TOUR');
    });

    it('clicking the "Semua" category calls onSelect with empty string', () => {
      const onSelect = vi.fn();
      render(<CategoryBrowser categories={categories} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('option', { name: /Semua/i }));
      expect(onSelect).toHaveBeenCalledWith('');
    });

    it('clicking different categories calls onSelect with respective values', () => {
      const onSelect = vi.fn();
      render(<CategoryBrowser categories={categories} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('option', { name: /Event/i }));
      expect(onSelect).toHaveBeenCalledWith('EVENT');

      fireEvent.click(screen.getByRole('option', { name: /Tour/i }));
      expect(onSelect).toHaveBeenCalledWith('TOUR');
    });
  });
});
