'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const supabase = createSupabaseBrowserClient();

const demoAccounts = [
  { label: 'Pelanggan', email: 'customer@lelampahan.test' },
  { label: 'Admin', email: 'admin@lelampahan.test' },
  { label: 'Super Admin', email: 'superadmin@lelampahan.test' },
  { label: 'Partner', email: 'partner@lelampahan.test' },
];



async function getDashboardDestination() {
  const response = await fetch('/api/auth/dashboard-destination', { cache: 'no-store' });
  if (!response.ok) return '/account';
  const body = await response.json();
  return typeof body.destination === 'string' ? body.destination : '/account';
}

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau kata sandi salah.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan cek kotak masuk Anda.';
  }

  if (normalized.includes('already registered') || normalized.includes('user already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk.';
  }

  return message;
}

export default function LoginPage() {
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? 'Password123!';
  const demoLoginEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'false');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(mapAuthError(authError.message));
      setLoading(false);
    } else {
      window.location.assign(await getDashboardDestination());
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Visual/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-lelampahan-cream to-lelampahan-gold/10">
        {/* Subtle batik pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="batik-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="20" fill="none" stroke="#431407" strokeWidth="1" />
                <circle cx="40" cy="40" r="10" fill="none" stroke="#431407" strokeWidth="0.5" />
                <circle cx="40" cy="40" r="3" fill="#431407" />
                <path d="M40 20 L40 0 M40 60 L40 80 M20 40 L0 40 M60 40 L80 40" stroke="#431407" strokeWidth="0.5" />
                <path d="M26 26 L14 14 M54 26 L66 14 M26 54 L14 66 M54 54 L66 66" stroke="#431407" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#batik-pattern)" />
          </svg>
        </div>

        {/* Branding content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-lelampahan-gold flex items-center justify-center">
              <span className="text-white text-xl font-bold">L</span>
            </div>
            <h1 className="text-3xl font-bold text-lelampahan-earth">Lelampahan</h1>
          </div>

          {/* Tagline */}
          <p className="text-lg text-lelampahan-brick font-medium max-w-sm">
            Jelajahi keindahan Yogyakarta melalui tour, event, dan pengalaman budaya terbaik.
          </p>

          {/* Decorative element */}
          <div className="mt-12 flex items-center gap-2">
            <div className="h-px w-12 bg-lelampahan-gold/40" />
            <div className="h-2 w-2 rounded-full bg-lelampahan-gold/60" />
            <div className="h-px w-12 bg-lelampahan-gold/40" />
          </div>

          <p className="mt-6 text-sm text-lelampahan-earth/60">
            Marketplace Yogyakarta-first untuk pengalaman tak terlupakan
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile branding (shown only on mobile/tablet) */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-lelampahan-gold flex items-center justify-center">
                <span className="text-white text-lg font-bold">L</span>
              </div>
              <h1 className="text-2xl font-bold text-lelampahan-earth">Lelampahan</h1>
            </div>
            <p className="text-sm text-lelampahan-brick text-center">
              Jelajahi keindahan Yogyakarta
            </p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-lelampahan-earth">Masuk</h2>
            <p className="mt-2 text-sm text-gray-500">
              Masuk untuk melihat pesanan, tiket, dan melanjutkan booking Anda.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Kata sandi"
              type="password"
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Masuk
            </Button>
          </form>

          {demoLoginEnabled && (
            <div className="mt-6 rounded-xl border border-lelampahan-gold/30 bg-lelampahan-cream/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-lelampahan-earth">Akun Demo</h3>
                  <p className="mt-1 text-xs text-gray-600">
                    Pilih role untuk mengisi email dan kata sandi demo.
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lelampahan-brick">
                  Demo
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoSelect(account.email)}
                    className="rounded-lg border border-lelampahan-gold/30 bg-white px-3 py-2 text-sm font-medium text-lelampahan-earth transition-colors hover:bg-lelampahan-gold/10"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation link to register */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-lelampahan-gold hover:text-lelampahan-brick transition-colors"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
