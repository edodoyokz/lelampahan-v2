// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  describe('variant classes', () => {
    it('renders primary variant with correct classes', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-lelampahan-gold');
      expect(button).toHaveClass('text-white');
    });

    it('renders secondary variant with correct classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('border-lelampahan-gold');
      expect(button).toHaveClass('text-lelampahan-gold');
    });

    it('renders destructive variant with correct classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders ghost variant with correct classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: 'Ghost' });
      expect(button).toHaveClass('text-lelampahan-brick');
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      render(<Button variant="primary" loading>Submit</Button>);
      const button = screen.getByRole('button', { name: 'Submit' });
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button variant="primary" loading>Submit</Button>);
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeDisabled();
    });

    it('sets aria-busy when loading', () => {
      render(<Button variant="primary" loading>Submit</Button>);
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button variant="primary" loading onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button variant="primary" disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button variant="primary" disabled onClick={handleClick}>Disabled</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies disabled styling classes', () => {
      render(<Button variant="primary" disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('sizes', () => {
    it('renders sm size with correct classes', () => {
      render(<Button variant="primary" size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('renders md size by default', () => {
      render(<Button variant="primary">Medium</Button>);
      const button = screen.getByRole('button', { name: 'Medium' });
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('renders lg size with correct classes', () => {
      render(<Button variant="primary" size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });
  });
});
