// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { AdminShell } from '@/components/layout/admin-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({ default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a> }));

global.fetch = vi.fn();

describe('AdminShell', () => {
  it('hides super admin navigation for admin role', () => {
    render(<AdminShell role="ADMIN" userLabel="Admin User"><div>Content</div></AdminShell>);
    expect(screen.queryByText('Pengguna')).not.toBeInTheDocument();
    expect(screen.queryByText('Audit')).not.toBeInTheDocument();
    expect(screen.queryByText('Pengaturan')).not.toBeInTheDocument();
  });

  it('shows super admin navigation and badge for super admin role', () => {
    render(<AdminShell role="SUPER_ADMIN" userLabel="Super Admin User"><div>Content</div></AdminShell>);
    expect(screen.getByText('Pengguna')).toBeInTheDocument();
    expect(screen.getByText('Audit')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('renders logout button and marketplace link', () => {
    render(<AdminShell role="ADMIN" userLabel="Admin User"><div>Content</div></AdminShell>);
    expect(screen.getByText('Keluar')).toBeInTheDocument();
    expect(screen.getByText('← Marketplace')).toBeInTheDocument();
  });
});
