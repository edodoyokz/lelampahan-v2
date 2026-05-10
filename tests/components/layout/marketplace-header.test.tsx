// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MarketplaceHeader } from '@/components/layout/marketplace-header';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/mobile-drawer', () => ({
  MobileDrawer: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="mobile-drawer">{children}</div> : null,
}));

describe('MarketplaceHeader', () => {
  it('renders logo text "Lelampahan"', () => {
    render(<MarketplaceHeader />);
    const logo = screen.getByText('Lelampahan');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders navigation links (Beranda, Jelajahi, Akun Saya) on desktop', () => {
    render(<MarketplaceHeader />);
    const homeLinks = screen.getAllByText('Beranda');
    const jelajahiLinks = screen.getAllByText('Jelajahi');
    const akunLinks = screen.getAllByText('Akun Saya');

    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    expect(jelajahiLinks.length).toBeGreaterThanOrEqual(1);
    expect(akunLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Masuk and Daftar buttons when user is null', () => {
    render(<MarketplaceHeader user={null} />);
    const loginButtons = screen.getAllByText('Masuk');
    const daftarButtons = screen.getAllByText('Daftar');

    expect(loginButtons.length).toBeGreaterThanOrEqual(1);
    expect(daftarButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows user name when user prop is provided', () => {
    render(<MarketplaceHeader user={{ name: 'Budi Santoso' }} />);
    const userNames = screen.getAllByText('Budi Santoso');
    expect(userNames.length).toBeGreaterThanOrEqual(1);
  });

  it('shows user avatar initial when no avatarUrl', () => {
    render(<MarketplaceHeader user={{ name: 'Budi Santoso' }} />);
    const initials = screen.getAllByText('B');
    expect(initials.length).toBeGreaterThanOrEqual(1);
  });
});
