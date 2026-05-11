// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AdminUsersPage from '../../app/admin/users/page';
import AdminAuditPage from '../../app/admin/audit/page';
import AdminSettingsPage from '../../app/admin/settings/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe('Super admin placeholder pages', () => {
  it('renders users page', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Manajemen Pengguna')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });
  it('renders audit page', () => {
    render(<AdminAuditPage />);
    expect(screen.getByText('Audit Aktivitas')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });
  it('renders settings page', () => {
    render(<AdminSettingsPage />);
    expect(screen.getByText('Pengaturan Platform')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });
});
