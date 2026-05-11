// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import TicketWalletPage from '../../app/account/tickets/page';

const getCurrentUser = vi.fn();
const findTicketsByUser = vi.fn();
const ensureUserProfileForAuthUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock('@/data/ticket', () => ({ findTicketsByUser: (id: string) => findTicketsByUser(id) }));
vi.mock('@/data/user', () => ({ ensureUserProfileForAuthUser: (input: unknown) => ensureUserProfileForAuthUser(input) }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('REDIRECT'); } }));
vi.mock('lucide-react', () => ({ Ticket: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} /> }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Ticket wallet page', () => {
  beforeEach(() => {
    getCurrentUser.mockResolvedValue({ id: 'auth-u1', email: 'citra@example.com', user_metadata: { full_name: 'Citra' } });
    ensureUserProfileForAuthUser.mockResolvedValue({ id: 'profile-u1' });
    findTicketsByUser.mockResolvedValue([{ id: 't1', code: 'TICKET-123', status: 'ACTIVE', order: { items: [{ ticketType: { name: 'Reguler' } }], session: { startsAt: '2026-05-11T02:00:00.000Z', listing: { title: 'Jelajah Kotagede' } } } }]);
  });
  it('renders ticket guidance and visual code', async () => {
    const ui = await TicketWalletPage();
    render(ui);
    expect(screen.getByText('Tiket Saya')).toBeInTheDocument();
    expect(screen.getByText('Tunjukkan kode tiket ini saat check-in di lokasi pengalaman.')).toBeInTheDocument();
    expect(screen.getByText('TICKET-123')).toBeInTheDocument();
    expect(ensureUserProfileForAuthUser).toHaveBeenCalledWith({
      authUserId: 'auth-u1',
      email: 'citra@example.com',
      name: 'Citra',
    });
    expect(findTicketsByUser).toHaveBeenCalledWith('profile-u1');
  });
});
