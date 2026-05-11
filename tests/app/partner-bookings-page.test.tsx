// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import BookingsPage from '../../app/partner/bookings/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Partner bookings page', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orders: [{ id: 'b1', orderNumber: 'LM-1', status: 'REQUESTED', totalAmount: 10000, createdAt: '2026-05-11', participants: [{ name: 'Citra' }], session: { listing: { title: 'Tour' } } }], total: 1, summary: { requested: 2, pendingPayment: 3, approved: 4, completed: 5 } }) }); });
  it('renders summary labels from server summary', async () => {
    render(<BookingsPage />);
    expect(await screen.findByText('Pesanan & Permintaan Booking')).toBeInTheDocument();
    expect(screen.getAllByText('Permintaan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Disetujui/Selesai')).toBeInTheDocument();
  });

  it('renders server summary stat values', async () => {
    render(<BookingsPage />);
    await screen.findByText('Pesanan & Permintaan Booking');
    // Permintaan value from summary.requested = 2
    expect(screen.getByText('2')).toBeInTheDocument();
    // Menunggu Pembayaran from summary.pendingPayment = 3
    expect(screen.getByText('3')).toBeInTheDocument();
    // Disetujui/Selesai from summary.approved + summary.completed = 9
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});
