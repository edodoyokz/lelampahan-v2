// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '../../../app/auth/login/page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/supabase/browser-client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}));

describe('LoginPage demo accounts', () => {
  const originalDemoFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN;
  const originalDemoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = originalDemoFlag;
    process.env.NEXT_PUBLIC_DEMO_PASSWORD = originalDemoPassword;
  });

  it('hides demo account buttons by default', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN;

    render(<LoginPage />);

    expect(screen.queryByText('Akun Demo')).not.toBeInTheDocument();
  });

  it('shows seeded demo role buttons when enabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'true';

    render(<LoginPage />);

    expect(screen.getByText('Akun Demo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pelanggan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Super Admin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Partner' })).toBeInTheDocument();
  });

  it('fills email and password when a demo role is selected', () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'true';
    process.env.NEXT_PUBLIC_DEMO_PASSWORD = 'DemoPass123!';

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Partner' }));

    expect(screen.getByLabelText('Email')).toHaveValue('partner@lelampahan.test');
    expect(screen.getByLabelText('Kata sandi')).toHaveValue('DemoPass123!');
  });
});
