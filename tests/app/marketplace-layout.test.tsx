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

vi.mock('@/lib/supabase/client', () => ({
  getCurrentUser: () => getCurrentUser(),
}));

describe('MarketplaceLayout', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  it('passes the authenticated user name to the marketplace header', async () => {
    getCurrentUser.mockResolvedValue({
      email: 'customer@lelampahan.test',
      user_metadata: { full_name: 'Citra Pelanggan' },
    });

    const ui = await MarketplaceLayout({ children: <div>Content</div> });
    render(ui);

    expect(screen.getAllByText('Citra Pelanggan').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Daftar')).not.toBeInTheDocument();
  });

  it('uses email prefix when authenticated user has no display name', async () => {
    getCurrentUser.mockResolvedValue({
      email: 'partner@lelampahan.test',
      user_metadata: {},
    });

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
