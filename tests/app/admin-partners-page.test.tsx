// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminPartnerPage from '../../app/admin/partners/page';

const showToast = vi.hoisted(() => vi.fn());

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ showToast }),
}));

describe('Admin partners page', () => {
  beforeEach(() => {
    showToast.mockReset();
  });

  it('renders status tabs and filters', async () => {
    const allPartners = [
      { id: 'p1', name: 'Pending Partner', status: 'PENDING_REVIEW', capabilities: [] },
      { id: 'p2', name: 'Approved Partner', status: 'APPROVED', capabilities: [] },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      // Server-side filtering: return only matching partners
      const urlObj = new URL(url, 'http://localhost');
      const status = urlObj.searchParams.get('status');
      const filtered = status ? allPartners.filter((p) => p.status === status) : allPartners;
      return Promise.resolve({ ok: true, json: async () => ({ partners: filtered, total: filtered.length }) });
    });

    render(<AdminPartnerPage />);
    expect((await screen.findAllByText('Pending Partner')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Review')).toBeInTheDocument();
    // Status badge shows "Disetujui" for APPROVED partner
    expect(screen.getAllByText('Disetujui').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: 'Disetujui' }));
    await waitFor(() => expect(screen.queryAllByText('Pending Partner')).toHaveLength(0));
    expect(screen.getAllByText('Approved Partner').length).toBeGreaterThanOrEqual(1);
  });

  it('shows a toast after approving a partner', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          partners: [{ id: 'p1', name: 'Pending Partner', status: 'PENDING_REVIEW', capabilities: [] }],
          total: 1,
        }),
      });
    });

    render(<AdminPartnerPage />);

    await screen.findAllByText('Pending Partner');
    fireEvent.click(screen.getAllByRole('button', { name: 'Setujui' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Setujui' }).at(-1)!);

    await waitFor(() => expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      message: expect.stringContaining('Partner disetujui'),
    })));
  });
});
