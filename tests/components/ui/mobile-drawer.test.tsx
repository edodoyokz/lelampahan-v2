// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileDrawer } from '@/components/ui/mobile-drawer';

describe('MobileDrawer', () => {
  describe('open/close behavior', () => {
    it('renders nothing when open is false', () => {
      const { container } = render(
        <MobileDrawer open={false} onClose={vi.fn()}>
          <p>Drawer content</p>
        </MobileDrawer>
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders content when open is true', () => {
      render(
        <MobileDrawer open={true} onClose={vi.fn()}>
          <p>Drawer content</p>
        </MobileDrawer>
      );
      expect(screen.getByText('Drawer content')).toBeInTheDocument();
    });

    it('renders with role="dialog" and aria-modal="true"', () => {
      render(
        <MobileDrawer open={true} onClose={vi.fn()}>
          <p>Content</p>
        </MobileDrawer>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('backdrop click', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <p>Content</p>
        </MobileDrawer>
      );
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Escape key', () => {
    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <p>Content</p>
        </MobileDrawer>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('position prop', () => {
    it('defaults to left position', () => {
      const { container } = render(
        <MobileDrawer open={true} onClose={vi.fn()}>
          <p>Content</p>
        </MobileDrawer>
      );
      // The drawer panel should have left-0 class for left position
      const panel = container.querySelector('.left-0');
      expect(panel).toBeInTheDocument();
    });

    it('applies right position when specified', () => {
      const { container } = render(
        <MobileDrawer open={true} onClose={vi.fn()} position="right">
          <p>Content</p>
        </MobileDrawer>
      );
      const panel = container.querySelector('.right-0');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('width constraints', () => {
    it('applies w-72 and max-w-[80vw] to drawer panel', () => {
      const { container } = render(
        <MobileDrawer open={true} onClose={vi.fn()}>
          <p>Content</p>
        </MobileDrawer>
      );
      const panel = container.querySelector('.w-72');
      expect(panel).toBeInTheDocument();
      // Check the class attribute directly since toHaveClass doesn't handle brackets well
      expect(panel?.className).toContain('max-w-[80vw]');
    });
  });

  describe('children rendering', () => {
    it('renders children inside the drawer', () => {
      render(
        <MobileDrawer open={true} onClose={vi.fn()}>
          <nav>
            <a href="/home">Home</a>
            <a href="/about">About</a>
          </nav>
        </MobileDrawer>
      );
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });
  });
});
