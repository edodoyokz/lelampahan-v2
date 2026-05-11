// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import MarketplaceLayout from '../../app/(marketplace)/layout';

vi.mock('@/components/layout/marketplace-footer', () => ({
  MarketplaceFooter: () => <footer>Footer</footer>,
}));

vi.mock('@/components/ui/toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const getCurrentUser = vi.fn();
const findPartnerContextByAuthUserId = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getCurrentUser: () => getCurrentUser(),
}));

vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: (id: string) => findPartnerContextByAuthUserId(id),
}));

describe('MarketplaceLayout', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    findPartnerContextByAuthUserId.mockReset();
  });

  it('passes the authenticated user name to the marketplace header', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'auth-customer',
      email: 'customer@lelampahan.test',
      user_metadata: { full_name: 'Citra Pelanggan' },
    });
    findPartnerContextByAuthUserId.mockResolvedValue(null);

    const ui = await MarketplaceLayout({ children: <div>Content</div> });
    render(ui);

    expect(screen.getAllByText('Citra Pelanggan').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Daftar')).not.toBeInTheDocument();
  });

  it('shows Dashboard link for authenticated admin users', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'auth-admin',
      email: 'admin@lelampahan.test',
      user_metadata: { full_name: 'Admin Lelampahan' },
      app_metadata: { role: 'ADMIN' },
    });

    const ui = await MarketplaceLayout({ children: <div>Content</div> });
    render(ui);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
  });

  it('uses email prefix when authenticated user has no display name', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'auth-partner',
      email: 'partner@lelampahan.test',
      user_metadata: {},
    });
    findPartnerContextByAuthUserId.mockResolvedValue(null);

    const ui = await MarketplaceLayout({ children: <div>Content</div> });
    render(ui);

    expect(screen.getAllByText('partner').length).toBeGreaterThanOrEqual(1);
  });

  it('shows auth buttons when there is no authenticated user', async () => {
    getCurrentUser.mockResolvedValue(null);

    const ui = await MarketplaceLayout({ children: <div>Content</div> });
    render(ui);

    expect(screen.getAllByText('Masuk').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Daftar').length).toBeGreaterThanOrEqual(1);
  });
});
