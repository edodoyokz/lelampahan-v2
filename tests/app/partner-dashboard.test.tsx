// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import PartnerDashboard from '../../app/partner/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

function mockDashboardResponse(data: Record<string, unknown>) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

describe('PartnerDashboard', () => {
  it('renders completed partner dashboard UI for approved partner', async () => {
    mockDashboardResponse({
      partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED', role: 'OWNER' },
      listings: { total: 5, draft: 1, pendingReview: 2, published: 2, rejected: 0 },
      bookings: { requested: 0, pendingPayment: 1, approved: 2, completed: 3, monthCount: 4 },
      revenue: { monthGross: 500000, estimatedPayout: 500000 },
    });

    render(<PartnerDashboard />);
    expect(await screen.findByText('Dashboard Partner')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Jogja Adventure · OWNER · APPROVED')).toBeInTheDocument());
    expect(screen.getByText('Pengalaman Aktif')).toBeInTheDocument();
    expect(screen.getByText('Draft/Review')).toBeInTheDocument();
    expect(screen.getByText('Pesanan Bulan Ini')).toBeInTheDocument();
    expect(screen.getByText('Pendapatan Estimasi')).toBeInTheDocument();
    expect(screen.getByText('Buat Pengalaman')).toBeInTheDocument();
    expect(screen.getByText('Lihat Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Pindai Tiket')).toBeInTheDocument();
  });

  it('hides scanner and orders CTAs when partner is not approved', async () => {
    mockDashboardResponse({
      partner: { id: 'p2', name: 'Pending Partner', status: 'PENDING_REVIEW', role: 'OWNER' },
      listings: { total: 0, draft: 0, pendingReview: 0, published: 0, rejected: 0 },
      bookings: { requested: 0, pendingPayment: 0, approved: 0, completed: 0, monthCount: 0 },
      revenue: { monthGross: 0, estimatedPayout: 0 },
    });

    render(<PartnerDashboard />);
    await waitFor(() => expect(screen.getByText('Pending Partner · OWNER · PENDING_REVIEW')).toBeInTheDocument());
    expect(screen.getByText('Pendaftaran partner sedang menunggu review admin.')).toBeInTheDocument();
    expect(screen.queryByText('Lihat Pesanan')).not.toBeInTheDocument();
    expect(screen.queryByText('Pindai Tiket')).not.toBeInTheDocument();
  });

  it('shows rejection message for rejected partner', async () => {
    mockDashboardResponse({
      partner: { id: 'p3', name: 'Rejected Partner', status: 'REJECTED', role: 'OWNER' },
      listings: { total: 0, draft: 0, pendingReview: 0, published: 0, rejected: 0 },
      bookings: { requested: 0, pendingPayment: 0, approved: 0, completed: 0, monthCount: 0 },
      revenue: { monthGross: 0, estimatedPayout: 0 },
    });

    render(<PartnerDashboard />);
    await waitFor(() => expect(screen.getByText('Pendaftaran partner ditolak. Hubungi admin untuk peninjauan ulang.')).toBeInTheDocument());
  });
});
