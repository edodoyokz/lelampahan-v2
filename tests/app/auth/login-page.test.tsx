// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from '../../../app/auth/login/page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

let mockSignInWithPassword = vi.fn();

vi.mock('@/lib/supabase/browser-client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      get signInWithPassword() {
        return mockSignInWithPassword;
      },
    },
  }),
}));

describe('LoginPage demo accounts', () => {
  const originalDemoFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN;
  const originalDemoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

  beforeEach(() => {
    mockSignInWithPassword = vi.fn();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = originalDemoFlag;
    process.env.NEXT_PUBLIC_DEMO_PASSWORD = originalDemoPassword;
  });

  it('shows demo account buttons by default outside production', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN;

    render(<LoginPage />);

    expect(screen.getByText('Akun Demo')).toBeInTheDocument();
  });

  it('hides demo account buttons when explicitly disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'false';

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

describe('LoginPage auth redirect', () => {
  const originalDemoFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = originalDemoFlag;
  });

  it('redirects to dashboard destination after successful login', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'false';
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { assign },
      writable: true,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ destination: '/admin' }),
    });
    mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@lelampahan.test' } });
    fireEvent.change(screen.getByLabelText('Kata sandi'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/admin'));
  });

  it('falls back to /account when dashboard destination lookup fails', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN = 'false';
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { assign },
      writable: true,
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@lelampahan.test' } });
    fireEvent.change(screen.getByLabelText('Kata sandi'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/account'));
  });
});
