// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import OrderHistoryPage from '../../app/account/orders/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Account orders page', () => {
  it('renders polished order UI for paid order', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        orders: [{ id: 'o1', orderNumber: 'LM-1', status: 'PAID', totalAmount: 100000, createdAt: '2026-05-11T00:00:00.000Z', session: { listing: { title: 'Jelajah Kotagede', slug: 'jelajah-kotagede' } } }],
      }),
    });

    render(<OrderHistoryPage />);
    expect(screen.getByText('Pesanan Saya')).toBeInTheDocument();
    expect(screen.getByText('Pantau status booking dan pembayaran Anda.')).toBeInTheDocument();
    expect(await screen.findByText('Dibayar')).toBeInTheDocument();
    expect(screen.getByText('Lihat Tiket')).toBeInTheDocument();
  });

  it('shows Lanjutkan Pembayaran action for pending payment orders', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        orders: [{ id: 'o2', orderNumber: 'LM-2', status: 'PENDING_PAYMENT', totalAmount: 50000, createdAt: '2026-05-10T00:00:00.000Z', session: { listing: { title: 'Test', slug: 'test' } } }],
      }),
    });

    render(<OrderHistoryPage />);
    expect(await screen.findByText('Lanjutkan Pembayaran')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<OrderHistoryPage />);
    expect(await screen.findByText('Gagal memuat pesanan. Coba lagi beberapa saat lagi.')).toBeInTheDocument();
  });
});
