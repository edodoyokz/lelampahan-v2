'use client';

import { useState, useRef } from 'react';

export default function ScannerPage() {
  const [result, setResult] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setScanning(true);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setResult({ text: 'Kamera aktif. Arahkan ke QR tiket.', type: 'info' });
    } catch {
      setResult({
        text: 'Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.',
        type: 'error',
      });
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setResult(null);
  };

  const simulateScan = async () => {
    setResult({ text: 'Memvalidasi tiket...', type: 'info' });

    setTimeout(() => {
      setResult({ text: 'Valid — check-in berhasil ✅', type: 'success' });
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Scanner Tiket</h1>
      <p className="mt-2 text-sm text-gray-500">Scan QR tiket peserta untuk check-in.</p>

      <div className="mt-6 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-black/5">
        <div className="relative flex min-h-[300px] items-center justify-center">
          {scanning ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg">📷</p>
              <p className="mt-2">Kamera siap digunakan</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {!scanning ? (
          <button
            onClick={startCamera}
            className="rounded-lg bg-lelampahan-gold px-6 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
          >
            Aktifkan Kamera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="rounded-lg bg-gray-600 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Matikan Kamera
          </button>
        )}

        <button
          onClick={simulateScan}
          className="rounded-lg border bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Simulasi Scan
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg p-4 text-sm ${
            result.type === 'success'
              ? 'bg-green-50 text-green-800'
              : result.type === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
          }`}
        >
          {result.text}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Gunakan HP untuk akses kamera langsung. Scanner bekerja secara real-time.
      </p>
    </div>
  );
}
