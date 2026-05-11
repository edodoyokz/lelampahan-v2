// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../../app/admin/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Admin dashboard', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ totalPartners: 3, totalListings: 9, pendingPartnerReviews: 1, pendingListingReviews: 2, grossRevenue: 750000 }) }); });
  it('renders review queue cards', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Antrean Review')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/dashboard-summary', { cache: 'no-store' });
    expect(screen.getByText('Partner Menunggu Review')).toBeInTheDocument();
    expect(screen.getByText('Pengalaman Menunggu Review')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
    expect(screen.getByText('Review Partner')).toBeInTheDocument();
    expect(screen.getByText('Review Pengalaman')).toBeInTheDocument();
  });
});
