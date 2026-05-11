// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { RoleBadge } from '@/components/ui/role-badge';
import { StatusFilterTabs } from '@/components/ui/status-filter-tabs';

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a>,
}));

describe('portal UI primitives', () => {
  it('renders PageHeader title, description and action', () => {
    render(<PageHeader title="Dashboard" description="Ringkasan akun" action={{ label: 'Buat', href: '/new' }} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ringkasan akun')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buat' })).toHaveAttribute('href', '/new');
  });

  it('renders StatCard label and value', () => {
    render(<StatCard label="Total Pesanan" value="3" helper="Bulan ini" />);
    expect(screen.getByText('Total Pesanan')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Bulan ini')).toBeInTheDocument();
  });

  it('renders QuickActionCard as link', () => {
    render(<QuickActionCard title="Lihat Tiket" description="Buka tiket aktif" href="/account/tickets" />);
    expect(screen.getByRole('link', { name: /Lihat Tiket/i })).toHaveAttribute('href', '/account/tickets');
  });

  it('renders RoleBadge for super admin', () => {
    render(<RoleBadge role="SUPER_ADMIN" />);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('renders status filter tabs and active state', () => {
    render(<StatusFilterTabs value="PUBLISHED" options={[{ label: 'Semua', value: 'ALL' }, { label: 'Terbit', value: 'PUBLISHED' }]} onChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terbit' })).toHaveAttribute('aria-pressed', 'true');
  });
});
