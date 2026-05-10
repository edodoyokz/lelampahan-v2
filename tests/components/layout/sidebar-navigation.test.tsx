// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { SidebarNavigation, NavItem } from '@/components/layout/sidebar-navigation';

// Mock next/link to render as a simple anchor tag
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockItems: NavItem[] = [
  { label: 'Dashboard', href: '/partner', icon: <svg data-testid="icon-dashboard" /> },
  { label: 'Listings', href: '/partner/listings', icon: <svg data-testid="icon-listings" /> },
  { label: 'Pesanan', href: '/partner/bookings', icon: <svg data-testid="icon-bookings" /> },
  { label: 'Scanner', href: '/partner/scanner', icon: <svg data-testid="icon-scanner" /> },
];

describe('SidebarNavigation', () => {
  describe('renders all nav items', () => {
    it('renders all nav items with correct labels', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner" />);

      for (const item of mockItems) {
        expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
      }
    });

    it('renders nav items as links with correct hrefs', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner" />);

      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      for (const item of mockItems) {
        expect(hrefs).toContain(item.href);
      }
    });
  });

  describe('active item highlighting', () => {
    it('active item has bg-lelampahan-cream class', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner/listings" />);

      // Get the desktop sidebar links (inside the aside element)
      const aside = screen.getByLabelText('Sidebar navigation');
      const links = aside.querySelectorAll('a');
      const activeLink = Array.from(links).find((link) => link.getAttribute('href') === '/partner/listings');

      expect(activeLink).toHaveClass('bg-lelampahan-cream');
    });

    it('inactive items have text-gray-600 class', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner/listings" />);

      const aside = screen.getByLabelText('Sidebar navigation');
      const links = aside.querySelectorAll('a');
      const inactiveLinks = Array.from(links).filter((link) => link.getAttribute('href') !== '/partner/listings');

      for (const link of inactiveLinks) {
        expect(link).toHaveClass('text-gray-600');
      }
    });

    it('active item has aria-current="page"', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner/listings" />);

      const aside = screen.getByLabelText('Sidebar navigation');
      const links = aside.querySelectorAll('a');
      const activeLink = Array.from(links).find((link) => link.getAttribute('href') === '/partner/listings');

      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('inactive items do not have aria-current attribute', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner/listings" />);

      const aside = screen.getByLabelText('Sidebar navigation');
      const links = aside.querySelectorAll('a');
      const inactiveLinks = Array.from(links).filter((link) => link.getAttribute('href') !== '/partner/listings');

      for (const link of inactiveLinks) {
        expect(link).not.toHaveAttribute('aria-current');
      }
    });
  });

  describe('title rendering', () => {
    it('renders title when provided', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner" title="Partner Portal" />);

      expect(screen.getByText('Partner Portal')).toBeInTheDocument();
    });

    it('does not render title heading when not provided', () => {
      render(<SidebarNavigation items={mockItems} currentPath="/partner" />);

      const aside = screen.getByLabelText('Sidebar navigation');
      const heading = aside.querySelector('h2');
      expect(heading).not.toBeInTheDocument();
    });
  });
});
