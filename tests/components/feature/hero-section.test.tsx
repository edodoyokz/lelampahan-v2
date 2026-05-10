// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '@/components/feature/hero-section';

describe('HeroSection', () => {
  it('renders the main headline', () => {
    render(<HeroSection onSearch={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /Jelajahi Yogyakarta/i })).toBeInTheDocument();
  });

  it('renders the sub-headline', () => {
    render(<HeroSection onSearch={vi.fn()} />);
    expect(screen.getByText(/Temukan tour, paket perjalanan/i)).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<HeroSection onSearch={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /Cari listing/i })).toBeInTheDocument();
  });

  it('renders the search button', () => {
    render(<HeroSection onSearch={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Cari/i })).toBeInTheDocument();
  });

  it('calls onSearch with trimmed query when form is submitted', () => {
    const onSearch = vi.fn();
    render(<HeroSection onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /Cari listing/i });
    fireEvent.change(input, { target: { value: '  Prambanan  ' } });
    fireEvent.submit(input.closest('form')!);

    expect(onSearch).toHaveBeenCalledWith('Prambanan');
  });

  it('does not call onSearch when query is empty', () => {
    const onSearch = vi.fn();
    render(<HeroSection onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /Cari listing/i });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('applies gradient background classes', () => {
    const { container } = render(<HeroSection onSearch={vi.fn()} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('from-lelampahan-cream');
  });
});
