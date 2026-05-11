// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import CheckoutPendingPage from '../../app/checkout/pending/page';
import CheckoutErrorPage from '../../app/checkout/error/page';
import CheckoutLoading from '../../app/checkout/loading';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('Checkout status pages', () => {
  it('renders pending page with Button-based order action and helpful detail', () => {
    render(<CheckoutPendingPage />);

    expect(screen.getByText('Pembayaran Menunggu Konfirmasi')).toBeInTheDocument();
    expect(screen.getByText(/Kami sedang menunggu konfirmasi pembayaran/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat Pesanan' })).toHaveAttribute('href', '/account/orders');
  });

  it('renders error page with retry and marketplace actions', () => {
    render(<CheckoutErrorPage />);

    expect(screen.getByText('Pembayaran Gagal')).toBeInTheDocument();
    expect(screen.getByText(/Transaksi belum berhasil diproses/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ulangi Checkout' })).toHaveAttribute('href', '/checkout');
    expect(screen.getByRole('link', { name: 'Kembali ke Marketplace' })).toHaveAttribute('href', '/');
  });

  it('renders checkout loading skeleton', () => {
    render(<CheckoutLoading />);

    expect(screen.getByRole('status', { name: 'Memuat checkout' })).toBeInTheDocument();
  });
});
