'use client';

import { FormEvent, useMemo, useState } from 'react';

interface Participant {
  name: string;
  email: string;
  phone: string;
}

export default function CheckoutPage() {
  const [sessionId, setSessionId] = useState('');
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [userId, setUserId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(50000);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', email: '', phone: '' },
  ]);
  const [status, setStatus] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);

  const totalAmount = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);

  const updateQuantity = (nextQuantity: number) => {
    const safeQuantity = Math.max(1, nextQuantity);
    setQuantity(safeQuantity);
    setParticipants((current) => {
      const next = [...current];
      while (next.length < safeQuantity) next.push({ name: '', email: '', phone: '' });
      return next.slice(0, safeQuantity);
    });
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    setParticipants((current) =>
      current.map((participant, i) =>
        i === index ? { ...participant, [field]: value } : participant,
      ),
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Membuat reservasi...');
    setQrString(null);

    const bookingResponse = await fetch('/api/booking/instant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        ticketTypeId,
        quantity,
        unitPrice,
        totalAmount,
        participants,
      }),
    });

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json();
      setStatus(error.error ?? 'Gagal membuat reservasi');
      return;
    }

    const order = await bookingResponse.json();
    setStatus('Membuat QRIS pembayaran...');

    const paymentResponse = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: totalAmount,
        idempotencyKey: `payment:create:${userId}:${order.orderNumber}:1`,
      }),
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      setStatus(error.error ?? 'Gagal membuat pembayaran');
      return;
    }

    const payment = await paymentResponse.json();
    setQrString(payment.qrString ?? `QRIS:${payment.id}`);
    setStatus('QRIS siap. Selesaikan pembayaran dalam 30 menit.');
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lelampahan-brick">
        Checkout
      </p>
      <h1 className="mt-4 text-3xl font-bold text-lelampahan-earth">Reservasi &amp; Pembayaran QRIS</h1>
      <p className="mt-2 text-sm text-amber-950/70">
        Halaman ini menghubungkan checkout ke API reservation dan payment. Pilih session/ticket dari listing detail pada iterasi berikutnya.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Session ID
            <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Ticket Type ID
            <input value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Jumlah
            <input type="number" min={1} value={quantity} onChange={(e) => updateQuantity(Number(e.target.value))} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Harga Satuan
            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <div className="rounded-lg bg-lelampahan-cream p-4 text-sm">
            <span className="text-gray-500">Total</span>
            <p className="mt-1 text-xl font-bold text-lelampahan-earth">Rp {totalAmount.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-lelampahan-earth">Data Peserta</h2>
          <div className="mt-3 space-y-4">
            {participants.map((participant, index) => (
              <div key={index} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
                <input placeholder={`Nama peserta ${index + 1}`} value={participant.name} onChange={(e) => updateParticipant(index, 'name', e.target.value)} required className="rounded-lg border px-3 py-2 text-sm" />
                <input type="email" placeholder="Email" value={participant.email} onChange={(e) => updateParticipant(index, 'email', e.target.value)} required className="rounded-lg border px-3 py-2 text-sm" />
                <input placeholder="No. HP" value={participant.phone} onChange={(e) => updateParticipant(index, 'phone', e.target.value)} required className="rounded-lg border px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        </div>

        <button className="rounded-full bg-lelampahan-gold px-6 py-3 text-sm font-semibold text-white hover:bg-lelampahan-brick">
          Buat QRIS
        </button>
      </form>

      {status && <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">{status}</div>}
      {qrString && (
        <div className="mt-4 rounded-2xl border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl border-2 border-dashed text-xs text-gray-500">
            {qrString}
          </div>
          <p className="mt-3 text-xs text-gray-500">Mock QRIS string. Provider QR image akan dipakai saat Midtrans/Xendit aktif.</p>
        </div>
      )}
    </section>
  );
}
