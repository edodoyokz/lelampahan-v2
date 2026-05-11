'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

type ScanResult =
  | {
      type: 'success';
      participantName: string;
      ticketCode: string;
      checkedInAt: string;
    }
  | {
      type: 'error';
      result: string;
      message: string;
    }
  | null;

export default function PindainerPage() {
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // ignore cleanup errors
        }
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const validateTicket = useCallback(async (ticketCode: string) => {
    // Debounce: prevent scanning the same code repeatedly
    if (ticketCode === lastScannedCodeRef.current) return;
    lastScannedCodeRef.current = ticketCode;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Small delay to avoid rapid re-scans
    debounceTimerRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const response = await fetch('/api/partner/scanner/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketCode }),
        });

        const data = await response.json();

        if (response.ok && data.type === 'success') {
          setScanResult({
            type: 'success',
            participantName: data.participantName ?? 'Peserta',
            ticketCode: data.ticketCode,
            checkedInAt: data.checkedInAt,
          });
        } else {
          setScanResult({
            type: 'error',
            result: data.result ?? 'INVALID_TICKET',
            message: data.message ?? 'Tiket tidak valid atau sudah digunakan.',
          });
        }
      } catch {
        setScanResult({
          type: 'error',
          result: 'NETWORK_ERROR',
          message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
        });
      } finally {
        setValidating(false);
      }
    }, 300);
  }, []);

  const onScanSuccess = useCallback(
    (decodedText: string) => {
      void validateTicket(decodedText);
    },
    [validateTicket],
  );

  const startCamera = async () => {
    setScanning(true);
    setScanResult(null);
    setCameraError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {
          // ignore failed scan frames
        },
      );
    } catch (error) {
      setCameraError(
        'Tidak dapat mengakses kamera. Pastikan izin kamera diberikan dan tidak digunakan oleh aplikasi lain.',
      );
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return;
    setScanResult(null);
    lastScannedCodeRef.current = '';
    await validateTicket(manualCode.trim());
  };

  const dismissResult = () => {
    setScanResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pemindai Tiket" description="Pindai QR tiket peserta untuk check-in." />

      {/* Camera Area - Large, optimized for mobile portrait */}
      <Card variant="outlined" padding="sm" className="overflow-hidden">
        <div
          id="qr-reader"
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-900"
        >
          {!scanning && !cameraError && (
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

          {cameraError && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-red-400">
              <p className="text-sm font-medium">Gagal mengakses kamera</p>
              <p className="text-xs text-red-300">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Camera controls */}
        <div className="mt-3 flex gap-3">
          {!scanning ? (
            <Button variant="primary" size="md" onClick={startCamera} className="flex-1" disabled={validating}>
              Aktifkan Kamera
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={stopCamera} className="flex-1">
              Matikan Kamera
            </Button>
          )}
        </div>
      </Card>

      {/* Scan Result Feedback */}
      {scanResult && scanResult.type === 'success' && (
        <div
          className="flex flex-col items-center gap-4 rounded-xl bg-green-50 border border-green-200 p-6 text-center"
          role="alert"
          aria-live="polite"
        >
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
                <span className="font-medium">Kode Tiket:</span>{' '}
                {scanResult.ticketCode}
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
            <p className="mt-1 text-sm text-red-700">{scanResult.message}</p>
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
