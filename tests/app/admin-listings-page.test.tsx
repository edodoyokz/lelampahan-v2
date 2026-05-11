// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminListingPage from '../../app/admin/listings/page';

describe('Admin listings page', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ listings: [{ id: 'l1', title: 'Pending Listing', type: 'TOUR', status: 'PENDING_REVIEW', partner: { name: 'P' }, _count: { sessions: 0 } }, { id: 'l2', title: 'Published Listing', type: 'TOUR', status: 'PUBLISHED', partner: { name: 'P' }, _count: { sessions: 1 } }] }) }); });
  it('renders status tabs and filters', async () => {
    render(<AdminListingPage />);
    expect((await screen.findAllByText('Pending Listing')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Terbit')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Terbit' }));
    await waitFor(() => expect(screen.queryAllByText('Pending Listing')).toHaveLength(0));
    expect(screen.getAllByText('Published Listing').length).toBeGreaterThanOrEqual(1);
  });
});
