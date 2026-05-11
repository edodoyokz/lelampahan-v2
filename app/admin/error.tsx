'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" strokeWidth={1.6} aria-hidden="true" />
      <h1 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h1>
      <p className="max-w-md text-sm text-gray-600">
        Maaf, terjadi kesalahan saat memuat halaman admin. Silakan coba lagi.
      </p>
      <p className="text-xs text-gray-400">
        {error.digest && `Error ID: ${error.digest}`}
      </p>
      <Button variant="primary" size="md" onClick={reset}>
        Coba Lagi
      </Button>
    </div>
  );
}
