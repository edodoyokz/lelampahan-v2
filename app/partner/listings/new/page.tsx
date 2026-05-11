'use client';

import { PageHeader } from '@/components/ui/page-header';
import { ListingForm } from '@/components/feature/listing-form';
import { useListingForm } from '@/hooks/use-listing-form';

export default function NewListingPage() {
  const form = useListingForm();

  const { validate, uploadCoverImage, buildPayload, setSubmitting, setResult, resetForm, partnerId } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setResult(null);

    if (!partnerId) {
      setResult('Akun belum terhubung ke partner.');
      setSubmitting(false);
      return;
    }

    try {
      const coverImage = await uploadCoverImage();
      const body = { ...buildPayload(), coverImage };

      const res = await fetch('/api/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setResult('Pengalaman berhasil dibuat.');
        resetForm();
      } else {
        const err = await res.json();
        setResult(`Gagal: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Gagal terhubung ke server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Buat Pengalaman Baru"
        description="Lengkapi informasi di bawah untuk membuat listing tour atau event baru."
      />
      <div className="mt-8">
        <ListingForm form={form} onSubmit={handleSubmit} submitLabel="Buat Listing" />
      </div>
    </div>
  );
}
