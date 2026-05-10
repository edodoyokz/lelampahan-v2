"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format-currency";

interface CheckoutSummaryProps {
  listingName: string;
  sessionDate: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrisUrl?: string;
  expiresAt?: Date;
  onRetry?: () => void;
}

function getTimeRemaining(expiresAt: Date): { minutes: number; seconds: number; expired: boolean } {
  const now = new Date().getTime();
  const expiry = expiresAt.getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, expired: false };
}

function CountdownTimer({ expiresAt, onExpired }: { expiresAt: Date; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTimeLeft(remaining);

      if (remaining.expired) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-1">Selesaikan pembayaran dalam</p>
      <p className="text-2xl font-bold text-lelampahan-earth tabular-nums">
        {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </p>
    </div>
  );
}

export function CheckoutSummary({
  listingName,
  sessionDate,
  ticketType,
  quantity,
  totalPrice,
  qrisUrl,
  expiresAt,
  onRetry,
}: CheckoutSummaryProps) {
  const [isExpired, setIsExpired] = useState(() => {
    if (!expiresAt) return false;
    return getTimeRemaining(expiresAt).expired;
  });

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card variant="outlined" padding="md">
        <h3 className="text-lg font-semibold text-lelampahan-earth mb-4">
          Ringkasan Pesanan
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Listing</dt>
            <dd className="font-medium text-gray-900 text-right max-w-[60%]">
              {listingName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Sesi</dt>
            <dd className="font-medium text-gray-900">{sessionDate}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Tipe Tiket</dt>
            <dd className="font-medium text-gray-900">{ticketType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Jumlah</dt>
            <dd className="font-medium text-gray-900">{quantity}</dd>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <dt className="font-semibold text-gray-900">Total</dt>
            <dd className="font-bold text-lelampahan-earth text-lg">
              {formatIDR(totalPrice)}
            </dd>
          </div>
        </dl>
      </Card>

      {/* QRIS Payment Section */}
      {qrisUrl && expiresAt && (
        <Card variant="elevated" padding="md">
          <h3 className="text-lg font-semibold text-lelampahan-earth mb-4 text-center">
            Pembayaran QRIS
          </h3>

          {isExpired ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-2">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Waktu pembayaran telah habis
              </p>
              <p className="text-xs text-gray-500">
                QR code sudah tidak berlaku. Silakan buat pembayaran baru.
              </p>
              {onRetry && (
                <Button variant="primary" size="md" onClick={onRetry}>
                  Buat Pembayaran Baru
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="w-56 h-56 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {qrisUrl ? (
                    <img
                      src={qrisUrl}
                      alt="QRIS QR Code"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-gray-400">QR Code</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Instructions */}
              <p className="text-xs text-gray-500 text-center">
                Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking Anda
              </p>

              {/* Countdown Timer */}
              <CountdownTimer
                expiresAt={expiresAt}
                onExpired={() => setIsExpired(true)}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export type { CheckoutSummaryProps };
