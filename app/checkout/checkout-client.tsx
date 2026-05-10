"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutSummary } from "@/components/feature/checkout-summary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Participant {
  name: string;
  email: string;
  phone: string;
}

interface SessionData {
  session: { id: string; startsAt: string; capacity: number };
  ticketType: { id: string; name: string; price: number };
  listing: { id: string; title: string; slug: string; type: string; timezone: string };
}

type CheckoutState =
  | "loading"
  | "form"
  | "submitting"
  | "payment"
  | "error";

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const ticketTypeId = searchParams.get("ticketTypeId") ?? "";

  const [state, setState] = useState<CheckoutState>("loading");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [quantity] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", email: "", phone: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment state
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const totalPrice = useMemo(() => {
    if (!sessionData) return 0;
    return quantity * sessionData.ticketType.price;
  }, [quantity, sessionData]);

  const sessionDateFormatted = useMemo(() => {
    if (!sessionData) return "";
    const date = new Date(sessionData.session.startsAt);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: sessionData.listing.timezone,
    }).format(date);
  }, [sessionData]);

  // Fetch session details on mount
  useEffect(() => {
    if (!sessionId || !ticketTypeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("error");
      setErrorMessage("Parameter sesi atau tipe tiket tidak ditemukan di URL.");
      return;
    }

    async function fetchSessionData() {
      try {
        const res = await fetch(
          `/api/checkout/session?sessionId=${sessionId}&ticketTypeId=${ticketTypeId}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Gagal memuat data sesi");
        }
        const data: SessionData = await res.json();
        setSessionData(data);
        setState("form");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Gagal memuat data checkout"
        );
      }
    }

    fetchSessionData();
  }, [sessionId, ticketTypeId]);

  const updateParticipant = (
    index: number,
    field: keyof Participant,
    value: string
  ) => {
    setParticipants((current) =>
      current.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
    // Clear field error on change
    setErrors((prev) => {
      const key = `${index}-${field}`;
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    participants.forEach((p, i) => {
      if (!p.name.trim()) {
        newErrors[`${i}-name`] = "Nama wajib diisi";
      }
      if (!p.email.trim()) {
        newErrors[`${i}-email`] = "Email wajib diisi";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        newErrors[`${i}-email`] = "Format email tidak valid";
      }
      if (!p.phone.trim()) {
        newErrors[`${i}-phone`] = "Nomor HP wajib diisi";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !sessionData) return;

    setState("submitting");
    setErrorMessage(null);

    try {
      // Step 1: Create booking reservation
      const bookingRes = await fetch("/api/booking/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ticketTypeId,
          quantity,
          unitPrice: sessionData.ticketType.price,
          totalAmount: totalPrice,
          participants: participants.map((p) => ({
            name: p.name.trim(),
            email: p.email.trim(),
            phone: p.phone.trim(),
          })),
        }),
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json();
        throw new Error(err.error ?? "Gagal membuat reservasi");
      }

      const order = await bookingRes.json();
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);

      // Step 2: Create QRIS payment
      const paymentRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          idempotencyKey: `payment:create:${order.id}:${order.orderNumber}:1`,
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        throw new Error(err.error ?? "Gagal membuat pembayaran QRIS");
      }

      const payment = await paymentRes.json();
      setQrisUrl(payment.qrString ?? `QRIS:${payment.id}`);
      setExpiresAt(new Date(payment.expiresAt));
      setState("payment");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    }
  };

  const handleRetry = useCallback(async () => {
    if (!orderId || !orderNumber) {
      // Reset to form if no order exists
      setState("form");
      return;
    }

    setState("submitting");
    setErrorMessage(null);

    try {
      const paymentRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          idempotencyKey: `payment:create:${orderId}:${orderNumber}:${Date.now()}`,
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        throw new Error(err.error ?? "Gagal membuat pembayaran baru");
      }

      const payment = await paymentRes.json();
      setQrisUrl(payment.qrString ?? `QRIS:${payment.id}`);
      setExpiresAt(new Date(payment.expiresAt));
      setState("payment");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal membuat pembayaran baru"
      );
    }
  }, [orderId, orderNumber]);

  const handleBackToForm = () => {
    setState("form");
    setErrorMessage(null);
    setQrisUrl(null);
    setExpiresAt(null);
    setOrderId(null);
    setOrderNumber(null);
  };

  // Loading state
  if (state === "loading") {
    return (
      <section className="mx-auto max-w-lg px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
        </div>
      </section>
    );
  }

  // Error state (no session data)
  if (state === "error" && !sessionData) {
    return (
      <section className="mx-auto max-w-lg px-4 py-8">
        <Card variant="outlined" padding="md">
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Terjadi Kesalahan
            </h2>
            <p className="text-sm text-gray-500">
              {errorMessage ?? "Tidak dapat memuat data checkout."}
            </p>
            <Button variant="primary" size="md" onClick={() => window.history.back()}>
              Kembali
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-lelampahan-brick">
          Checkout
        </p>
        <h1 className="mt-1 text-2xl font-bold text-lelampahan-earth">
          Selesaikan Pemesanan
        </h1>
      </div>

      {/* Order Summary */}
      {sessionData && (
        <CheckoutSummary
          listingName={sessionData.listing.title}
          sessionDate={sessionDateFormatted}
          ticketType={sessionData.ticketType.name}
          quantity={quantity}
          totalPrice={totalPrice}
          qrisUrl={state === "payment" ? (qrisUrl ?? undefined) : undefined}
          expiresAt={state === "payment" ? (expiresAt ?? undefined) : undefined}
          onRetry={handleRetry}
        />
      )}

      {/* Error message (with session data available) */}
      {state === "error" && sessionData && (
        <Card variant="outlined" padding="md">
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {errorMessage ?? "Terjadi kesalahan"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm" onClick={handleBackToForm}>
                Coba Lagi
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                Kembali
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Participant Form */}
      {(state === "form" || state === "submitting") && sessionData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="outlined" padding="md">
            <h3 className="text-lg font-semibold text-lelampahan-earth mb-4">
              Data Peserta
            </h3>
            <div className="space-y-5">
              {participants.map((participant, index) => (
                <div key={index} className="space-y-3">
                  {participants.length > 1 && (
                    <p className="text-sm font-medium text-gray-600">
                      Peserta {index + 1}
                    </p>
                  )}
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={participant.name}
                    onChange={(e) =>
                      updateParticipant(index, "name", e.target.value)
                    }
                    error={errors[`${index}-name`]}
                    disabled={state === "submitting"}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={participant.email}
                    onChange={(e) =>
                      updateParticipant(index, "email", e.target.value)
                    }
                    error={errors[`${index}-email`]}
                    disabled={state === "submitting"}
                  />
                  <Input
                    label="Nomor HP"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={participant.phone}
                    onChange={(e) =>
                      updateParticipant(index, "phone", e.target.value)
                    }
                    error={errors[`${index}-phone`]}
                    disabled={state === "submitting"}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            type="submit"
            loading={state === "submitting"}
            className="w-full"
          >
            Bayar dengan QRIS
          </Button>
        </form>
      )}

      {/* Payment pending info */}
      {state === "payment" && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Scan QR code di atas menggunakan aplikasi e-wallet atau mobile
            banking Anda. Pembayaran akan dikonfirmasi secara otomatis.
          </p>
        </div>
      )}
    </section>
  );
}
