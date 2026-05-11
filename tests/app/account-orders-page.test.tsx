// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import OrderHistoryPage from '../../app/account/orders/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Account orders page', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orders: [{ id: 'o1', orderNumber: 'LM-1', status: 'PAID', totalAmount: 100000, createdAt: '2026-05-11T00:00:00.000Z', session: { listing: { title: 'Jelajah Kotagede', slug: 'jelajah-kotagede' } } }] }) }); });
  it('renders polished order UI', async () => {
    render(<OrderHistoryPage />);
    expect(screen.getByText('Pesanan Saya')).toBeInTheDocument();
    expect(screen.getByText('Pantau status booking dan pembayaran Anda.')).toBeInTheDocument();
    expect(await screen.findByText('Dibayar')).toBeInTheDocument();
    expect(screen.getByText('Lihat Detail')).toBeInTheDocument();
  });
});
