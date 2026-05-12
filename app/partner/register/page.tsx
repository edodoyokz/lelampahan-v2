'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

interface FormState {
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  tours: boolean;
  events: boolean;
}

const INITIAL: FormState = {
  name: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  tours: true,
  events: false,
};

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const capabilities: string[] = [];
    if (form.tours) capabilities.push('TOURS');
    if (form.events) capabilities.push('EVENTS');

    if (capabilities.length === 0) {
      setError('Pilih minimal satu jenis layanan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          requestedCapabilities: capabilities,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountHolder: form.accountHolder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Pendaftaran gagal. Coba lagi.');
        return;
      }

      router.push('/partner');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Daftar sebagai Partner"
        description="Isi formulir berikut untuk mendaftarkan bisnis Anda di Lelampahan. Tim kami akan meninjau pendaftaran dalam 1–2 hari kerja."
      />

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* Informasi Bisnis */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-base font-semibold text-lelampahan-earth">Informasi Bisnis</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Nama Bisnis"
              placeholder="Contoh: Jogja Heritage Tours"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Deskripsi Singkat
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Ceritakan bisnis Anda secara singkat..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
              />
            </div>
            <Input
              label="Email Kontak"
              type="email"
              placeholder="bisnis@email.com"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              required
            />
            <Input
              label="Nomor WhatsApp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.contactPhone}
              onChange={(e) => set('contactPhone', e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Jenis Layanan */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-base font-semibold text-lelampahan-earth">Jenis Layanan</h2>
          <p className="mt-1 text-sm text-gray-500">Pilih jenis pengalaman yang akan Anda tawarkan.</p>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tours}
                onChange={(e) => set('tours', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-lelampahan-gold focus:ring-lelampahan-gold"
              />
              <span className="text-sm font-medium text-gray-700">Tur</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.events}
                onChange={(e) => set('events', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-lelampahan-gold focus:ring-lelampahan-gold"
              />
              <span className="text-sm font-medium text-gray-700">Acara</span>
            </label>
          </div>
        </Card>

        {/* Rekening Bank */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-base font-semibold text-lelampahan-earth">Rekening Bank</h2>
          <p className="mt-1 text-sm text-gray-500">Untuk keperluan pembayaran hasil penjualan.</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Nama Bank"
              placeholder="Contoh: BCA, Mandiri, BNI"
              value={form.bankName}
              onChange={(e) => set('bankName', e.target.value)}
              required
            />
            <Input
              label="Nomor Rekening"
              placeholder="Contoh: 1234567890"
              value={form.accountNumber}
              onChange={(e) => set('accountNumber', e.target.value)}
              required
            />
            <Input
              label="Nama Pemilik Rekening"
              placeholder="Sesuai buku tabungan"
              value={form.accountHolder}
              onChange={(e) => set('accountHolder', e.target.value)}
              required
            />
          </div>
        </Card>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            Kirim Pendaftaran
          </Button>
        </div>
      </form>
    </div>
  );
}
