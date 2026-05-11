// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import PartnerDashboard from '../../app/partner/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('PartnerDashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ role: 'OWNER', partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ listings: [{ status: 'PUBLISHED' }, { status: 'DRAFT' }, { status: 'PENDING_REVIEW' }] }) });
  });
  it('renders completed partner dashboard UI', async () => {
    render(<PartnerDashboard />);
    expect(await screen.findByText('Dashboard Partner')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Jogja Adventure · OWNER · APPROVED')).toBeInTheDocument());
    expect(screen.getByText('Pengalaman Aktif')).toBeInTheDocument();
    expect(screen.getByText('Draft/Review')).toBeInTheDocument();
    expect(screen.getByText('Pesanan Bulan Ini')).toBeInTheDocument();
    expect(screen.getByText('Pendapatan Estimasi')).toBeInTheDocument();
    expect(screen.getByText('Buat Pengalaman')).toBeInTheDocument();
  });
});
