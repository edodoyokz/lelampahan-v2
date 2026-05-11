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
  it('renders filters and filters listings', async () => {
    render(<ListingManagement />);
    expect((await screen.findAllByText('Draft Tour')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Terbit')).toBeInTheDocument();
    expect(screen.getByText('Ditolak')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Terbit' }));
    await waitFor(() => expect(screen.queryAllByText('Draft Tour')).toHaveLength(0));
    expect(screen.getAllByText('Live Tour').length).toBeGreaterThanOrEqual(1);
  });
});
