// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { AdminShell } from '@/components/layout/admin-shell';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
}));

describe('AdminShell', () => {
  it('renders children content', () => {
    render(
      <AdminShell>
        <div data-testid="page-content">Admin page</div>
      </AdminShell>
    );
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders all admin nav items', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>
    );
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Partners').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Listings').length).toBeGreaterThanOrEqual(1);
  });

  it('links to correct admin hrefs', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/admin');
    expect(hrefs).toContain('/admin/partners');
    expect(hrefs).toContain('/admin/listings');
  });

  it('marks active item with aria-current="page"', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>
    );
    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    expect(activeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders hamburger button for mobile drawer on mobile', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>
    );
    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });
    expect(hamburger).toBeInTheDocument();
  });
});
