// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../../app/admin/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Admin dashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        partners: { total: 5, pendingReview: 2, approved: 3, rejected: 0 },
        listings: { total: 9, pendingReview: 4, published: 5, rejected: 0 },
        orders: { total: 12, pendingPayment: 1, paid: 6, completed: 5, revenue: 900000 },
      }),
    });
  });

  it('renders review queue cards', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Antrean Review')).toBeInTheDocument();
    expect(screen.getByText('Review Partner')).toBeInTheDocument();
    expect(screen.getByText('Review Pengalaman')).toBeInTheDocument();
  });

  it('renders real stat cards from dashboard endpoint', async () => {
    render(<AdminDashboard />);
    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Rp 900.000')).toBeInTheDocument();
  });
});
