'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const supabase = createSupabaseBrowserClient();

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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(mapAuthError(authError.message));
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lelampahan-cream px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-lelampahan-earth">Cek Email Anda</h1>
          <p className="mt-4 text-gray-600">
            Kami sudah mengirim email konfirmasi ke <strong>{email}</strong>. Klik link di email
            untuk mengaktifkan akun Anda.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
          >
            Kembali ke halaman masuk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-lelampahan-earth via-lelampahan-brick to-lelampahan-gold lg:flex">
        {/* Batik pattern overlay */}
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="batik-register" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="30" cy="30" r="3" fill="currentColor" />
              <path d="M30 22 L30 10 M30 38 L30 50 M22 30 L10 30 M38 30 L50 30" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#batik-register)" className="text-white" />
        </svg>

        {/* Branding content */}
        <div className="relative z-10 px-12 text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">L</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold">Lelampahan</h2>
          <p className="mt-4 text-lg text-white/80">
            Jelajahi keindahan Yogyakarta melalui tour, event, dan pengalaman budaya yang tak terlupakan.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 lg:px-16">
        {/* Mobile branding (shown only on mobile) */}
        <div className="mb-8 text-center lg:hidden">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lelampahan-gold">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-lelampahan-earth">Lelampahan</h2>
        </div>

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-lelampahan-earth">Buat Akun</h1>
          <p className="mt-2 text-sm text-gray-500">
            Daftar untuk mulai memesan pengalaman lokal Yogyakarta.
          </p>

          <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              id="name"
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email"
              id="email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Kata sandi"
              id="password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimal 6 karakter"
            />

            <Input
              label="Konfirmasi kata sandi"
              id="confirm-password"
              type="password"
              required
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="mt-2 w-full"
            >
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-lelampahan-gold hover:text-lelampahan-brick"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
