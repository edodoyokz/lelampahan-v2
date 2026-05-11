'use client';

import { useEffect, useState } from 'react';

export type ListingType = 'TOUR' | 'EVENT';
export type BookingMode = 'INSTANT_CONFIRMATION' | 'REQUEST_TO_BOOK';

export interface UploadedCoverImage {
  key: string;
  url: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  alt?: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
}

export interface SessionItem {
  startsAt: string;
  endsAt: string;
  capacity: number;
  ticketTypeName: string;
  price: number;
}

export interface ListingFormData {
  title: string;
  description: string;
  type: ListingType;
  bookingMode: BookingMode;
  coverImageFile: File | null;
  coverPreviewUrl: string | null;
  duration: string;
  meetingPoint: string;
  venue: string;
  itinerary: ItineraryItem[];
  included: string;
  excluded: string;
  sessions: SessionItem[];
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

function splitTextList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function useListingForm(initialData?: Partial<ListingFormData> & { status?: string }) {
  const [type, setType] = useState<ListingType>(initialData?.type ?? 'TOUR');
  const [bookingMode, setBookingMode] = useState<BookingMode>(initialData?.bookingMode ?? 'INSTANT_CONFIRMATION');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialData?.coverPreviewUrl ?? null);
  const [duration, setDuration] = useState(initialData?.duration ?? '');
  const [meetingPoint, setMeetingPoint] = useState(initialData?.meetingPoint ?? '');
  const [venue, setVenue] = useState(initialData?.venue ?? '');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(
    initialData?.itinerary ?? [{ time: '', activity: '' }],
  );
  const [included, setIncluded] = useState(initialData?.included ?? '');
  const [excluded, setExcluded] = useState(initialData?.excluded ?? '');
  const [sessions, setSessions] = useState<SessionItem[]>(
    initialData?.sessions ?? [
      { startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 },
    ],
  );
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listingStatus, setListingStatus] = useState<string | undefined>(initialData?.status);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode) return; // already have partner context from initial data
    async function loadPartnerContext() {
      const response = await fetch('/api/partner/me', { cache: 'no-store' });
      if (!response.ok) {
        setResult('Akun belum terhubung ke partner.');
        return;
      }
      const context = await response.json();
      setPartnerId(context.partner.id);
    }
    void loadPartnerContext();
  }, [isEditMode]);

  const addItineraryItem = () => {
    setItinerary([...itinerary, { time: '', activity: '' }]);
  };

  const removeItineraryItem = (index: number) => {
    if (itinerary.length > 1) {
      setItinerary(itinerary.filter((_, i) => i !== index));
    }
  };

  const updateItinerary = (index: number, field: 'time' | 'activity', value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const addSession = () => {
    setSessions([
      ...sessions,
      { startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 },
    ]);
  };

  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((_, i) => i !== index));
    }
  };

  const updateSession = (
    index: number,
    field: keyof SessionItem,
    value: string | number,
  ) => {
    const updated = [...sessions] as SessionItem[];
    (updated[index] as unknown as Record<string, string | number>)[field] = value;
    setSessions(updated);
  };

  const handleCoverImageChange = (file: File | null) => {
    if (coverPreviewUrl && !initialData?.coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    if (!file) {
      setCoverImageFile(null);
      setCoverPreviewUrl(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      setErrors((current) => ({ ...current, coverImage: 'Format gambar harus JPG, PNG, atau WebP' }));
      setCoverImageFile(null);
      setCoverPreviewUrl(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((current) => ({ ...current, coverImage: 'Ukuran gambar maksimal 5MB' }));
      setCoverImageFile(null);
      setCoverPreviewUrl(null);
      return;
    }

    setErrors((current) => {
      const { coverImage, ...rest } = current;
      void coverImage;
      return rest;
    });
    setCoverImageFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  const uploadCoverImage = async (): Promise<UploadedCoverImage | undefined> => {
    if (!coverImageFile) return undefined;

    const signResponse = await fetch('/api/upload/listing-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: coverImageFile.name,
        contentType: coverImageFile.type,
        sizeBytes: coverImageFile.size,
      }),
    });

    if (!signResponse.ok) {
      const error = await signResponse.json().catch(() => ({}));
      throw new Error(error.error ?? 'Gagal menyiapkan upload gambar');
    }

    const target = (await signResponse.json()) as { uploadUrl: string; key: string; publicUrl: string };
    const uploadResponse = await fetch(target.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': coverImageFile.type },
      body: coverImageFile,
    });

    if (!uploadResponse.ok) {
      throw new Error('Gagal mengupload gambar ke storage');
    }

    return {
      key: target.key,
      url: target.publicUrl,
      mimeType: coverImageFile.type as UploadedCoverImage['mimeType'],
      sizeBytes: coverImageFile.size,
    };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Judul pengalaman wajib diisi';
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (type === 'TOUR' && !duration.trim()) newErrors.duration = 'Durasi wajib diisi untuk tour';
    if (type === 'EVENT' && !venue.trim()) newErrors.venue = 'Venue wajib diisi untuk event';

    sessions.forEach((session, i) => {
      if (!session.startsAt) newErrors[`session-${i}-startsAt`] = 'Waktu mulai wajib diisi';
      if (!session.endsAt) newErrors[`session-${i}-endsAt`] = 'Waktu selesai wajib diisi';
      if (session.capacity < 1) newErrors[`session-${i}-capacity`] = 'Kapasitas minimal 1';
      if (!session.ticketTypeName.trim()) newErrors[`session-${i}-ticketTypeName`] = 'Nama tipe tiket wajib diisi';
      if (session.price < 0) newErrors[`session-${i}-price`] = 'Harga tidak boleh negatif';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    title,
    type,
    description,
    bookingMode,
    partnerId,
    timezone: 'Asia/Jakarta',
    included: included.trim() || undefined,
    excluded: excluded.trim() || undefined,
    tourDetails:
      type === 'TOUR'
        ? {
            duration,
            meetingPoint,
            itinerary: itinerary.filter((i) => i.time && i.activity),
            included: splitTextList(included),
            excluded: splitTextList(excluded),
          }
        : undefined,
    eventDetails: type === 'EVENT' ? { venue } : undefined,
    sessions,
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCoverImageFile(null);
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(null);
    setDuration('');
    setMeetingPoint('');
    setVenue('');
    setIncluded('');
    setExcluded('');
    setItinerary([{ time: '', activity: '' }]);
    setSessions([{ startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 }]);
    setErrors({});
  };

  return {
    // State
    type, setType,
    bookingMode, setBookingMode,
    title, setTitle,
    description, setDescription,
    coverImageFile, setCoverImageFile,
    coverPreviewUrl, setCoverPreviewUrl,
    duration, setDuration,
    meetingPoint, setMeetingPoint,
    venue, setVenue,
    itinerary, setItinerary,
    included, setIncluded,
    excluded, setExcluded,
    sessions, setSessions,
    partnerId,
    submitting, setSubmitting,
    result, setResult,
    errors, setErrors,
    listingStatus,
    isEditMode,

    // Actions
    setPartnerId,
    addItineraryItem,
    removeItineraryItem,
    updateItinerary,
    addSession,
    removeSession,
    updateSession,
    handleCoverImageChange,
    uploadCoverImage,
    validate,
    buildPayload,
    resetForm,
  };
}
