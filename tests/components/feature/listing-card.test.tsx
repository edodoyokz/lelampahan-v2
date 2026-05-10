// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { ListingCard } from '@/components/feature/listing-card';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const baseProps = {
  slug: 'borobudur-sunrise-tour',
  title: 'Borobudur Sunrise Tour',
  type: 'TOUR' as const,
  location: 'Magelang, Jawa Tengah',
  priceFrom: 150000,
  partnerName: 'Jogja Adventures',
  sessionsCount: 3,
};

describe('ListingCard', () => {
  it('renders title text', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByText('Borobudur Sunrise Tour')).toBeInTheDocument();
  });

  it('renders location when provided', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByText('Magelang, Jawa Tengah')).toBeInTheDocument();
  });

  it('does not render location when not provided', () => {
    const { location, ...propsWithoutLocation } = baseProps;
    render(<ListingCard {...propsWithoutLocation} />);
    expect(screen.queryByText('Magelang, Jawa Tengah')).not.toBeInTheDocument();
  });

  it('renders price formatted in IDR', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
  });

  it('renders "Lihat detail" when priceFrom is not provided', () => {
    const { priceFrom, ...propsWithoutPrice } = baseProps;
    render(<ListingCard {...propsWithoutPrice} />);
    expect(screen.getByText('Lihat detail')).toBeInTheDocument();
  });

  it('renders type badge for Tur', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByText('Tur')).toBeInTheDocument();
  });

  it('renders type badge for Acara', () => {
    render(<ListingCard {...baseProps} type="EVENT" />);
    expect(screen.getByText('Acara')).toBeInTheDocument();
  });

  it('links to correct slug (/l/{slug})', () => {
    render(<ListingCard {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/l/borobudur-sunrise-tour');
  });

  it('renders partner name and sessions count', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByText('Jogja Adventures · 3 sesi')).toBeInTheDocument();
  });
});
