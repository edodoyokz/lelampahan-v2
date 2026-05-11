// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SessionsPage from '../../app/partner/listings/[id]/sessions/page';

const showToast = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'listing-1' }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ showToast }),
}));

describe('Partner listing sessions page', () => {
  beforeEach(() => {
    showToast.mockReset();
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({ sessions: [] }) });
    });
  });

  it('uses toast feedback after sessions are saved', async () => {
    render(<SessionsPage />);

    await screen.findByText('Jadwal & Tiket');
    fireEvent.change(screen.getByLabelText('Mulai'), { target: { value: '2026-06-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Selesai'), { target: { value: '2026-06-01T11:00' } });
    fireEvent.change(screen.getByLabelText('Batas Waktu Booking'), { target: { value: '2026-05-31T17:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Semua' }));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      message: expect.stringContaining('Sesi berhasil disimpan'),
    })));
  });
});
