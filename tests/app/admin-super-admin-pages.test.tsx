// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import AdminSettingsPage from '../../app/admin/settings/page';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

// Users and Audit pages are now real data-fetching pages (client components with fetch).
// They are covered by integration tests; here we only test the static settings page.

describe('Super admin pages', () => {
  it('renders settings page', () => {
    render(<AdminSettingsPage />);
    expect(screen.getByText('Pengaturan Platform')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });
});
