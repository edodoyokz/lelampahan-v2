'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

type PindaiResult =
  | {
      type: 'success';
      participantName: string;
      listingTitle: string;
      sessionInfo: string;
    }
  | {
      type: 'error';
      reason: string;
    }
  | null;

export default function PindainerPage() {
  const [scanResult, setPindaiResult] = useState<PindaiResult>(null);
  const [scanning, setPindaining] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setPindaining(true);
    setPindaiResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setPindaiResult({
        type: 'error',
        reason: 'Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.',
      });
      setPindaining(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setPindaining(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return;

    setValidating(true);
    setPindaiResult(null);

    // Simulate validation — replace with actual API call
    setTimeout(() => {
      if (manualCode.trim().toLowerCase() === 'invalid') {
        setPindaiResult({
          type: 'error',
          reason: 'Tiket tidak valid atau sudah digunakan.',
        });
      } else {
        setPindaiResult({
          type: 'success',
          participantName: 'Peserta',
          listingTitle: 'Tour Candi Prambanan',
          sessionInfo: '25 Jan 2025, 09:00 WIB',
        });
      }
      setValidating(false);
      setManualCode('');
    }, 1000);
  };

  const dismissResult = () => {
    setPindaiResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pemindai Tiket" description="Pindai QR tiket peserta untuk check-in." />

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Validasi manual saat ini berjalan dalam mode demo.
      </div>

      {/* Camera Area - Large, optimized for mobile portrait */}
      <Card variant="outlined" padding="sm" className="overflow-hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-900">
          {scanning ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
              <p className="text-sm font-medium">Kamera siap digunakan</p>
              <p className="text-xs text-gray-500">
                Arahkan kamera ke kode QR tiket peserta
              </p>
            </div>
          )}

          {/* Pindai overlay frame when camera is active */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-2xl border-2 border-white/60" />
            </div>
          )}
        </div>

        {/* Camera controls */}
        <div className="mt-3 flex gap-3">
          {!scanning ? (
            <Button variant="primary" size="md" onClick={startCamera} className="flex-1">
              Aktifkan Kamera
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={stopCamera} className="flex-1">
              Matikan Kamera
            </Button>
          )}
        </div>
      </Card>

      {/* Pindai Result Feedback */}
      {scanResult && scanResult.type === 'success' && (
        <div
          className="flex flex-col items-center gap-4 rounded-xl bg-green-50 border border-green-200 p-6 text-center"
          role="alert"
          aria-live="polite"
        >
          {/* Large checkmark icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-green-800">Check-in Berhasil</p>
            <div className="mt-2 space-y-1 text-sm text-green-700">
              <p>
                <span className="font-medium">Peserta:</span>{' '}
                {scanResult.participantName}
              </p>
              <p>
                <span className="font-medium">Listing:</span>{' '}
                {scanResult.listingTitle}
              </p>
              <p>
                <span className="font-medium">Sesi:</span>{' '}
                {scanResult.sessionInfo}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissResult}>
            Tutup
          </Button>
        </div>
      )}

      {scanResult && scanResult.type === 'error' && (
        <div
          className="flex flex-col items-center gap-4 rounded-xl bg-red-50 border border-red-200 p-6 text-center"
          role="alert"
          aria-live="polite"
        >
          {/* Large X icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-red-800">Validasi Gagal</p>
            <p className="mt-1 text-sm text-red-700">{scanResult.reason}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissResult}>
            Tutup
          </Button>
        </div>
      )}

      {/* Manual Ticket Code Input - Fallback */}
      <Card variant="outlined" padding="md">
        <h2 className="text-lg font-semibold text-lelampahan-earth">
          Input Manual
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Masukkan kode tiket secara manual jika QR tidak terbaca.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              label="Kode Tiket"
              placeholder="Masukkan kode tiket..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSubmit();
              }}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              size="md"
              loading={validating}
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
            >
              Validasi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
