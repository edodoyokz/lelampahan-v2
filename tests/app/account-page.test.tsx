// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AccountProfilePage from '../../app/account/page';

const getCurrentUser = vi.fn();
const redirect = vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); });

vi.mock('@/lib/supabase/client', () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock('@/data/order', () => ({
  findOrderCountByUser: vi.fn().mockResolvedValue(3),
  findPendingPaymentOrderCountByUser: vi.fn().mockResolvedValue(1),
}));
vi.mock('@/data/ticket', () => ({
  findActiveTicketCountByUser: vi.fn().mockResolvedValue(2),
}));
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Account page', () => {
  beforeEach(() => { getCurrentUser.mockReset(); redirect.mockClear(); });

  it('renders customer dashboard UI', async () => {
    getCurrentUser.mockResolvedValue({ email: 'citra@example.com', user_metadata: { full_name: 'Citra Pelanggan' } });
    const ui = await AccountProfilePage();
    render(ui);
    expect(await screen.findByText('Dashboard Akun')).toBeInTheDocument();
    expect(screen.getByText('Halo, Citra Pelanggan')).toBeInTheDocument();
    expect(screen.getByText('Total Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Tiket Aktif')).toBeInTheDocument();
    expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi Pengalaman')).toBeInTheDocument();
    expect(screen.getByText('Tiket Saya')).toBeInTheDocument();
    expect(screen.getByText('Riwayat Pesanan')).toBeInTheDocument();
    expect(await screen.findByText('Lanjutkan Pembayaran')).toBeInTheDocument();
  });
});
