// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { AccountShell } from '@/components/layout/account-shell';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/account'),
}));

describe('AccountShell', () => {
  it('renders children content', () => {
    render(
      <AccountShell>
        <div data-testid="page-content">Page content</div>
      </AccountShell>
    );
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders Profil navigation item', () => {
    render(
      <AccountShell>
        <div>Content</div>
      </AccountShell>
    );
    const profilLinks = screen.getAllByText('Profil');
    expect(profilLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Pesanan navigation item', () => {
    render(
      <AccountShell>
        <div>Content</div>
      </AccountShell>
    );
    const pesananLinks = screen.getAllByText('Pesanan');
    expect(pesananLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Tiket Saya navigation item', () => {
    render(
      <AccountShell>
        <div>Content</div>
      </AccountShell>
    );
    const walletLinks = screen.getAllByText('Tiket Saya');
    expect(walletLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('links to correct hrefs', () => {
    render(
      <AccountShell>
        <div>Content</div>
      </AccountShell>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/account');
    expect(hrefs).toContain('/account/orders');
    expect(hrefs).toContain('/account/tickets');
  });

  it('marks active item with aria-current="page"', async () => {
    const { usePathname } = await import('next/navigation');
    vi.mocked(usePathname).mockReturnValue('/account/orders');

    render(
      <AccountShell>
        <div>Content</div>
      </AccountShell>
    );

    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    expect(activeLinks.length).toBeGreaterThanOrEqual(1);
    expect(activeLinks[0]).toHaveAttribute('href', '/account/orders');
  });
});
