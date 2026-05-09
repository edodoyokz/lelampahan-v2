'use client';

import { useState } from 'react';

export default function ScannerPage() {
  const [result, setResult] = useState<string | null>(null);

  const handleSimulateScan = async () => {
    setResult('Scanning...');
    // Placeholder: will call camera API and /api/scanner/validate in a later task
    setTimeout(() => {
      setResult('Tiket valid — check-in berhasil ✅');
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Scanner Tiket</h1>
      <p className="mt-2 text-sm text-gray-500">Scan QR tiket peserta untuk check-in.</p>

      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-400">Kamera scanner akan aktif di sini.</p>
        <p className="mt-2 text-xs text-gray-400">(Gunakan HP untuk scan langsung)</p>

        <button
          onClick={handleSimulateScan}
          className="mt-6 rounded-lg bg-lelampahan-gold px-6 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
        >
          Simulasi Scan
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          {result}
        </div>
      )}
    </div>
  );
}
