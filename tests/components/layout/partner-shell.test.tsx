// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { PartnerShell } from '@/components/layout/partner-shell';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/partner'),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

global.fetch = vi.fn();

describe('PartnerShell', () => {
  it('renders children content', () => {
    render(
      <PartnerShell userLabel="Partner User">
        <div data-testid="page-content">Partner page</div>
      </PartnerShell>
    );
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders all partner nav items', () => {
    render(
      <PartnerShell userLabel="Partner User">
        <div>Content</div>
      </PartnerShell>
    );
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pengalaman').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pesanan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pemindai').length).toBeGreaterThanOrEqual(1);
  });

  it('links to correct partner hrefs', () => {
    render(
      <PartnerShell userLabel="Partner User">
        <div>Content</div>
      </PartnerShell>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/partner');
    expect(hrefs).toContain('/partner/listings');
    expect(hrefs).toContain('/partner/bookings');
    expect(hrefs).toContain('/partner/scanner');
  });

  it('marks active item with aria-current="page"', () => {
    render(
      <PartnerShell userLabel="Partner User">
        <div>Content</div>
      </PartnerShell>
    );
    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    expect(activeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders logout button and marketplace link', () => {
    render(
      <PartnerShell userLabel="Partner User">
        <div>Content</div>
      </PartnerShell>
    );
    expect(screen.getByText('Keluar')).toBeInTheDocument();
    expect(screen.getByText('← Marketplace')).toBeInTheDocument();
  });
});
