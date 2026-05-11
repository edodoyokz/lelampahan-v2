// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../../app/admin/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Admin dashboard', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ total: 1 }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ total: 2, listings: [{ status: 'PENDING_REVIEW' }] }) }); });
  it('renders review queue cards', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Antrean Review')).toBeInTheDocument();
    expect(screen.getByText('Review Partner')).toBeInTheDocument();
    expect(screen.getByText('Review Pengalaman')).toBeInTheDocument();
  });
});
