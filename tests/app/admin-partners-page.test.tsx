// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminPartnerPage from '../../app/admin/partners/page';

describe('Admin partners page', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ partners: [{ id: 'p1', name: 'Pending Partner', status: 'PENDING_REVIEW', capabilities: [] }, { id: 'p2', name: 'Approved Partner', status: 'APPROVED', capabilities: [] }] }) }); });
  it('renders status tabs and filters', async () => {
    render(<AdminPartnerPage />);
    expect((await screen.findAllByText('Pending Partner')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Review')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Disetujui' }));
    await waitFor(() => expect(screen.queryAllByText('Pending Partner')).toHaveLength(0));
    expect(screen.getAllByText('Approved Partner').length).toBeGreaterThanOrEqual(1);
  });
});
