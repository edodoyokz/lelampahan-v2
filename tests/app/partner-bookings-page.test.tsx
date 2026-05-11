// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import BookingsPage from '../../app/partner/bookings/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Partner bookings page', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orders: [{ id: 'b1', orderNumber: 'LM-1', status: 'REQUESTED', totalAmount: 10000, createdAt: '2026-05-11', participants: [{ name: 'Citra' }], session: { listing: { title: 'Tour' } } }] }) }); });
  it('renders summary labels', async () => {
    render(<BookingsPage />);
    expect(await screen.findByText('Pesanan & Permintaan Booking')).toBeInTheDocument();
    expect(screen.getAllByText('Permintaan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Disetujui/Selesai')).toBeInTheDocument();
  });
});
