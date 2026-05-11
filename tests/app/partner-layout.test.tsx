// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import PartnerLayout from '../../app/partner/layout';

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

const getCurrentUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  getCurrentUser: () => getCurrentUser(),
}));

const findPartnerContextByAuthUserId = vi.fn();
vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: (id: string) => findPartnerContextByAuthUserId(id),
}));

vi.mock('@/components/layout/partner-shell', () => ({
  PartnerShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="partner-shell">{children}</div>
  ),
}));

describe('PartnerLayout', () => {
  beforeEach(() => {
    mockRedirect.mockReset();
    getCurrentUser.mockReset();
    findPartnerContextByAuthUserId.mockReset();
  });

  it('redirects unauthenticated users to login', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(PartnerLayout({ children: <div>Children</div> })).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects authenticated users without partner membership to account', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'auth-customer',
      email: 'customer@lelampahan.test',
    });
    findPartnerContextByAuthUserId.mockResolvedValue(null);

    await expect(PartnerLayout({ children: <div>Children</div> })).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/account');
  });

  it('renders partner shell for users with partner membership', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'auth-partner',
      email: 'partner@lelampahan.test',
    });
    findPartnerContextByAuthUserId.mockResolvedValue({ partner: { id: 'p1' } });

    const ui = await PartnerLayout({ children: <div>Partner Content</div> });
    render(ui);

    expect(screen.getByTestId('partner-shell')).toBeInTheDocument();
    expect(screen.getByText('Partner Content')).toBeInTheDocument();
  });
});
