// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ListingManagement from '../../app/partner/listings/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Partner listings page', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ role: 'OWNER', partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ listings: [{ id: 'l1', title: 'Draft Tour', type: 'TOUR', status: 'DRAFT', _count: { sessions: 0 } }, { id: 'l2', title: 'Live Tour', type: 'TOUR', status: 'PUBLISHED', _count: { sessions: 1 } }] }) });
  });
  it('renders filters and listings', async () => {
    render(<ListingManagement />);
    expect((await screen.findAllByText('Draft Tour')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Semua')).toBeInTheDocument();
    // Filter tab and status badge both show Indonesian labels
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Terbit').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ditolak').length).toBeGreaterThanOrEqual(1);
  });

  it('sends status filter to server on filter change', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ role: 'OWNER', partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ listings: [{ id: 'l1', title: 'Draft Tour', type: 'TOUR', status: 'DRAFT', _count: { sessions: 0 } }, { id: 'l2', title: 'Live Tour', type: 'TOUR', status: 'PUBLISHED', _count: { sessions: 1 } }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ role: 'OWNER', partner: { id: 'p1', name: 'Jogja Adventure', status: 'APPROVED' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ listings: [{ id: 'l2', title: 'Live Tour', type: 'TOUR', status: 'PUBLISHED', _count: { sessions: 1 } }], total: 1 }) });
    global.fetch = mockFetch;

    render(<ListingManagement />);
    await screen.findAllByText('Draft Tour');

    fireEvent.click(screen.getByRole('button', { name: 'Terbit' }));

    await waitFor(() => {
      const statusCall = mockFetch.mock.calls.find((call: string[]) =>
        typeof call[0] === 'string' && call[0].includes('status=PUBLISHED')
      );
      expect(statusCall).toBeDefined();
    });

    await waitFor(() => expect(screen.queryAllByText('Draft Tour')).toHaveLength(0));
    expect(screen.getAllByText('Live Tour').length).toBeGreaterThanOrEqual(1);
  });
});
