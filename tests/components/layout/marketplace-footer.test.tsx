// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MarketplaceFooter } from '@/components/layout/marketplace-footer';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('MarketplaceFooter', () => {
  it('renders the Lelampahan brand name', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText('Lelampahan')).toBeInTheDocument();
  });

  it('renders the platform description', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText(/Marketplace Yogyakarta/i)).toBeInTheDocument();
  });

  it('renders navigation section heading', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText('Navigasi')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jelajahi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tentang Kami' })).toBeInTheDocument();
  });

  it('renders contact section heading', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText('Kontak')).toBeInTheDocument();
  });

  it('renders contact email', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText(/info@lelampahan\.com/i)).toBeInTheDocument();
  });

  it('renders legal section heading', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByRole('link', { name: /Syarat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kebijakan Privasi/i })).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(<MarketplaceFooter />);
    expect(screen.getByText(/Lelampahan\. Hak cipta dilindungi/i)).toBeInTheDocument();
  });

  it('applies bg-lelampahan-earth class for dark background', () => {
    const { container } = render(<MarketplaceFooter />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-lelampahan-earth');
    expect(footer).toHaveClass('text-white');
  });
});
