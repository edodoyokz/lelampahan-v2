// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AccountProfilePage from '../../app/account/page';

const getCurrentUser = vi.fn();
const redirect = vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); });
const ensureUserProfileForAuthUser = vi.fn();
const getCustomerDashboardSummary = vi.fn();

vi.mock('@/lib/supabase/client', () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock('@/data/user', () => ({ ensureUserProfileForAuthUser: (input: unknown) => ensureUserProfileForAuthUser(input) }));
vi.mock('@/data/dashboard-summary', () => ({ getCustomerDashboardSummary: (id: string) => getCustomerDashboardSummary(id) }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Account page', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    redirect.mockClear();
    ensureUserProfileForAuthUser.mockResolvedValue({ id: 'profile-1' });
    getCustomerDashboardSummary.mockResolvedValue({ totalOrders: 8, activeTickets: 3, pendingPaymentOrders: 2 });
  });

  it('renders customer dashboard UI', async () => {
    getCurrentUser.mockResolvedValue({ id: 'auth-1', email: 'citra@example.com', user_metadata: { full_name: 'Citra Pelanggan' } });
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
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(getCustomerDashboardSummary).toHaveBeenCalledWith('profile-1');
    expect(screen.getByText('Profil Akun')).toBeInTheDocument();
  });
});
