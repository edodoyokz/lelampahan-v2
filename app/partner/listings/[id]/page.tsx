'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { ListingForm } from '@/components/feature/listing-form';
import { useListingForm } from '@/hooks/use-listing-form';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

interface ListingData {
  id: string;
  title: string;
  type: 'TOUR' | 'EVENT';
  description: string;
  status: string;
  bookingMode: 'INSTANT_CONFIRMATION' | 'REQUEST_TO_BOOK';
  timezone: string;
  partnerId: string;
  partner?: { id: string; name: string };
  tourDetail?: {
    duration?: string | null;
    meetingPoint?: string | null;
    itinerary?: Array<{ time: string; activity: string }> | null;
    included?: string[] | string | null;
    excluded?: string[] | string | null;
  } | null;
  eventDetail?: {
    venue?: string | null;
  } | null;
  sessions?: Array<{
    id: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    ticketTypes?: Array<{ name: string; price: number }>;
  }>;
  images?: Array<{ url: string; isCover: boolean }>;
}

function normalizeItinerary(itinerary: unknown): Array<{ time: string; activity: string }> {
  if (!itinerary) return [{ time: '', activity: '' }];
  if (Array.isArray(itinerary)) {
    return itinerary as Array<{ time: string; activity: string }>;
  }
  return [{ time: '', activity: '' }];
}

function normalizeTextList(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function formatDateTimeForInput(isoString: string): string {
  if (!isoString) return '';
  // Convert ISO to YYYY-MM-DDTHH:MM for datetime-local input
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function splitTextList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function EditListingForm({ id, listing, initialData }: { id: string; listing: ListingData; initialData: NonNullable<Parameters<typeof useListingForm>[0]> }) {
  const form = useListingForm(initialData);
  const { validate, uploadCoverImage, setSubmitting, setResult, setPartnerId } = form;

  useEffect(() => {
    setPartnerId(listing.partnerId);
  }, [listing.partnerId, setPartnerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const coverImage = await uploadCoverImage();

      const payload: Record<string, unknown> = {
        title: form.title,
        type: form.type,
        description: form.description,
        bookingMode: form.bookingMode,
        sessions: form.sessions,
      };

      if (coverImage) {
        payload.coverImage = coverImage;
      }

      if (form.type === 'TOUR') {
        payload.tourDetails = {
          duration: form.duration,
          meetingPoint: form.meetingPoint,
          itinerary: form.itinerary.filter((i: { time: string; activity: string }) => i.time && i.activity),
          included: splitTextList(form.included),
          excluded: splitTextList(form.excluded),
        };
      }

      if (form.type === 'EVENT') {
        payload.eventDetails = {
          venue: form.venue,
        };
      }

      const res = await fetch(`/api/listing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setResult('Perubahan berhasil disimpan.');
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

  return <ListingForm form={form} onSubmit={handleSubmit} submitLabel="Simpan Perubahan" />;
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadListing() {
      try {
        const response = await fetch(`/api/listing/${id}`, { cache: 'no-store' });
        if (!response.ok) {
          if (response.status === 404) {
            setError('not-found');
            return;
          }
          setError('Gagal memuat data pengalaman.');
          return;
        }
        const data: ListingData = await response.json();
        setListing(data);
      } catch {
        setError('Gagal memuat data pengalaman.');
      } finally {
        setLoading(false);
      }
    }

    void loadListing();
  }, [id]);

  // Build initial data for the form once listing is loaded
  const initialData = listing
    ? {
        title: listing.title,
        description: listing.description,
        type: listing.type,
        bookingMode: listing.bookingMode,
        duration: listing.tourDetail?.duration ?? '',
        meetingPoint: listing.tourDetail?.meetingPoint ?? '',
        venue: listing.eventDetail?.venue ?? '',
        itinerary: normalizeItinerary(listing.tourDetail?.itinerary),
        included: normalizeTextList(listing.tourDetail?.included),
        excluded: normalizeTextList(listing.tourDetail?.excluded),
        coverPreviewUrl: listing.images?.find((img) => img.isCover)?.url ?? null,
        sessions: listing.sessions?.map((s) => ({
          startsAt: formatDateTimeForInput(s.startsAt),
          endsAt: formatDateTimeForInput(s.endsAt),
          capacity: s.capacity,
          ticketTypeName: s.ticketTypes?.[0]?.name ?? 'Regular',
          price: s.ticketTypes?.[0]?.price ?? 0,
        })) ?? [
          { startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 },
        ],
        status: listing.status,
      }
    : undefined;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Edit Pengalaman" description="Memuat data..." />
        <div className="mt-8 space-y-4">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  if (error === 'not-found' || !listing) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Pengalaman" description={`Edit detail pengalaman #${id}`}>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={getStatusVariant(listing.status)} label={listing.status} />
        </div>
      </PageHeader>

      <div className="mt-8">
        <EditListingForm key={listing.id} id={id} listing={listing} initialData={initialData!} />
      </div>
    </div>
  );
}
