// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminListingPage from '../../app/admin/listings/page';

describe('Admin listings page', () => {
  it('renders status tabs and filters', async () => {
    const allListings = [
      { id: 'l1', title: 'Pending Listing', type: 'TOUR', status: 'PENDING_REVIEW', partner: { name: 'P' }, _count: { sessions: 0 } },
      { id: 'l2', title: 'Published Listing', type: 'TOUR', status: 'PUBLISHED', partner: { name: 'P' }, _count: { sessions: 1 } },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      const status = urlObj.searchParams.get('status');
      const filtered = status ? allListings.filter((l) => l.status === status) : allListings;
      return Promise.resolve({ ok: true, json: async () => ({ listings: filtered, total: filtered.length }) });
    });

    render(<AdminListingPage />);
    expect((await screen.findAllByText('Pending Listing')).length).toBeGreaterThanOrEqual(1);
    // Status badge now shows Indonesian label "Terbit" for PUBLISHED status
    expect(screen.getAllByText('Terbit').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: 'Terbit' }));
    await waitFor(() => expect(screen.queryAllByText('Pending Listing')).toHaveLength(0));
    await waitFor(() => expect(screen.getAllByText('Published Listing').length).toBeGreaterThanOrEqual(1));
  });
});
