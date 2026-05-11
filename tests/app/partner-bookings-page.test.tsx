// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookingsPage from '../../app/partner/bookings/page';

const showToast = vi.hoisted(() => vi.fn());

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Partner bookings page', () => {
  beforeEach(() => {
    showToast.mockReset();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orders: [{ id: 'b1', orderNumber: 'LM-1', status: 'REQUESTED', totalAmount: 10000, createdAt: '2026-05-11', participants: [{ name: 'Citra' }], session: { listing: { title: 'Tour' } } }], total: 1, summary: { requested: 2, pendingPayment: 3, approved: 4, completed: 5 } }) });
  });
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

  it('shows a toast after approving a booking request', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'b1', status: 'PARTNER_APPROVED' }) });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          orders: [{ id: 'b1', orderNumber: 'LM-1', status: 'REQUESTED', totalAmount: 10000, createdAt: '2026-05-11', participants: [{ name: 'Citra' }], session: { listing: { title: 'Tour' } } }],
          total: 1,
          summary: { requested: 2, pendingPayment: 3, approved: 4, completed: 5 },
        }),
      });
    });

    render(<BookingsPage />);

    await screen.findAllByText('LM-1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Setujui' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Setujui' }).at(-1)!);

    await waitFor(() => expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      message: expect.stringContaining('Pesanan disetujui'),
    })));
  });
});
