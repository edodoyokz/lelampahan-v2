'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ListingType = 'TOUR' | 'EVENT';
type BookingMode = 'INSTANT_CONFIRMATION' | 'REQUEST_TO_BOOK';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadedCoverImage {
  key: string;
  url: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  alt?: string;
}

export default function NewListingPage() {
  const [type, setType] = useState<ListingType>('TOUR');
  const [bookingMode, setBookingMode] = useState<BookingMode>('INSTANT_CONFIRMATION');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [venue, setVenue] = useState('');
  const [itinerary, setItinerary] = useState<Array<{ time: string; activity: string }>>([
    { time: '', activity: '' },
  ]);
  const [included, setIncluded] = useState('');
  const [excluded, setExcluded] = useState('');
  const [sessions, setSessions] = useState<
    Array<{
      startsAt: string;
      endsAt: string;
      capacity: number;
      ticketTypeName: string;
      price: number;
    }>
  >([{ startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 }]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
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
  }, []);

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
    updated[index][field] = value;
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
    field: keyof (typeof sessions)[0],
    value: string | number
  ) => {
    const updated = [...sessions];
    (updated[index] as Record<string, string | number>)[field] = value;
    setSessions(updated);
  };

  const handleCoverImageChange = (file: File | null) => {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    if (!file) {
      setCoverImageFile(null);
      setCoverPreviewUrl(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
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
      alt: title || undefined,
    };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Judul listing wajib diisi';
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (type === 'TOUR' && !duration.trim()) newErrors.duration = 'Durasi wajib diisi untuk tour';
    if (type === 'EVENT' && !venue.trim()) newErrors.venue = 'Venue wajib diisi untuk event';

    sessions.forEach((session, i) => {
      if (!session.startsAt) newErrors[`session-${i}-startsAt`] = 'Waktu mulai wajib diisi';
      if (!session.endsAt) newErrors[`session-${i}-endsAt`] = 'Waktu selesai wajib diisi';
      if (session.capacity < 1)
        newErrors[`session-${i}-capacity`] = 'Kapasitas minimal 1';
      if (!session.ticketTypeName.trim())
        newErrors[`session-${i}-ticketTypeName`] = 'Nama tipe tiket wajib diisi';
      if (session.price < 0) newErrors[`session-${i}-price`] = 'Harga tidak boleh negatif';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      const body = {
        title,
        type,
        description,
        bookingMode,
        partnerId,
        timezone: 'Asia/Jakarta',
        included: included.trim() || undefined,
        excluded: excluded.trim() || undefined,
        coverImage,
        tourDetails:
          type === 'TOUR'
            ? {
                duration,
                meetingPoint,
                itinerary: itinerary.filter((i) => i.time && i.activity),
              }
            : undefined,
        eventDetails: type === 'EVENT' ? { venue } : undefined,
      };

      const res = await fetch('/api/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setResult('Listing berhasil dibuat ✅');
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
        setSessions([
          { startsAt: '', endsAt: '', capacity: 10, ticketTypeName: 'Regular', price: 50000 },
        ]);
        setErrors({});
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
      <h1 className="text-2xl font-bold text-lelampahan-earth md:text-3xl">Buat Listing Baru</h1>
      <p className="mt-1 text-sm text-gray-500">
        Lengkapi informasi di bawah untuk membuat listing tour atau event baru.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* Section 1: Informasi Dasar */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-lg font-semibold text-lelampahan-earth">Informasi Dasar</h2>
          <p className="mt-1 text-sm text-gray-500">Detail utama listing Anda.</p>

          <div className="mt-6 flex flex-col gap-5">
            <Input
              label="Judul Listing"
              placeholder="Contoh: Jelajah Kotagede Heritage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsikan tour atau event Anda secara detail..."
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="coverImage" className="text-sm font-medium text-gray-700">
                Gambar Cover
              </label>
              <input
                id="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleCoverImageChange(event.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-lelampahan-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-lelampahan-earth hover:file:bg-lelampahan-gold/20"
              />
              <p className="text-xs text-gray-500">Opsional. Format JPG, PNG, atau WebP. Maksimal 5MB.</p>
              {coverPreviewUrl && (
                <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <img src={coverPreviewUrl} alt="Preview cover listing" className="h-full w-full object-cover" />
                </div>
              )}
              {errors.coverImage && <p className="text-sm text-red-600">{errors.coverImage}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipe Listing</label>
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('TOUR')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    type === 'TOUR'
                      ? 'bg-lelampahan-gold text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🗺️ Tour
                </button>
                <button
                  type="button"
                  onClick={() => setType('EVENT')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    type === 'EVENT'
                      ? 'bg-lelampahan-gold text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🎉 Event
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Mode Booking</label>
              <div className="mt-1 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode('INSTANT_CONFIRMATION')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    bookingMode === 'INSTANT_CONFIRMATION'
                      ? 'bg-lelampahan-gold text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ⚡ Instant Confirmation
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('REQUEST_TO_BOOK')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    bookingMode === 'REQUEST_TO_BOOK'
                      ? 'bg-lelampahan-gold text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📋 Request to Book
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {bookingMode === 'INSTANT_CONFIRMATION'
                  ? 'Pesanan langsung dikonfirmasi tanpa persetujuan manual.'
                  : 'Pesanan memerlukan persetujuan Anda sebelum dikonfirmasi.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Section 2: Detail Tour/Event */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-lg font-semibold text-lelampahan-earth">
            Detail {type === 'TOUR' ? 'Tour' : 'Event'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {type === 'TOUR'
              ? 'Informasi spesifik tentang tour Anda.'
              : 'Informasi spesifik tentang event Anda.'}
          </p>

          <div className="mt-6 flex flex-col gap-5">
            {type === 'TOUR' && (
              <>
                <Input
                  label="Durasi"
                  placeholder="Contoh: 4 jam"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  error={errors.duration}
                  helperText="Estimasi durasi tour dari awal hingga selesai"
                />

                <Input
                  label="Titik Kumpul"
                  placeholder="Contoh: Pasar Kotagede"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  helperText="Lokasi pertemuan peserta sebelum tour dimulai"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Itinerary</label>
                  <p className="text-xs text-gray-500">
                    Tambahkan jadwal aktivitas selama tour berlangsung.
                  </p>
                  {itinerary.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <input
                        placeholder="Jam (08:00)"
                        value={item.time}
                        onChange={(e) => updateItinerary(i, 'time', e.target.value)}
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
                      />
                      <input
                        placeholder="Aktivitas"
                        value={item.activity}
                        onChange={(e) => updateItinerary(i, 'activity', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
                      />
                      {itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItineraryItem(i)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          aria-label="Hapus item itinerary"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItineraryItem}
                    className="mt-1 self-start text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
                  >
                    + Tambah item itinerary
                  </button>
                </div>
              </>
            )}

            {type === 'EVENT' && (
              <Input
                label="Venue / Lokasi"
                placeholder="Contoh: Taman Budaya Yogyakarta"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                error={errors.venue}
                helperText="Lokasi penyelenggaraan event"
              />
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="included" className="text-sm font-medium text-gray-700">
                Yang Termasuk (Included)
              </label>
              <textarea
                id="included"
                rows={3}
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
                placeholder="Contoh: Tiket masuk, guide lokal, snack..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
              />
              <p className="text-xs text-gray-500">
                Fasilitas atau item yang sudah termasuk dalam harga.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="excluded" className="text-sm font-medium text-gray-700">
                Yang Tidak Termasuk (Excluded)
              </label>
              <textarea
                id="excluded"
                rows={3}
                value={excluded}
                onChange={(e) => setExcluded(e.target.value)}
                placeholder="Contoh: Transportasi pribadi, makan siang..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold"
              />
              <p className="text-xs text-gray-500">
                Item yang tidak termasuk dan perlu disiapkan peserta sendiri.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: Sesi & Harga */}
        <Card variant="outlined" padding="lg">
          <h2 className="text-lg font-semibold text-lelampahan-earth">Sesi & Harga</h2>
          <p className="mt-1 text-sm text-gray-500">
            Atur jadwal sesi dan harga tiket untuk listing Anda.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {sessions.map((session, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sesi {i + 1}</span>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSession(i)}
                      className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Waktu Mulai</label>
                    <input
                      type="datetime-local"
                      value={session.startsAt}
                      onChange={(e) => updateSession(i, 'startsAt', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                        errors[`session-${i}-startsAt`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`session-${i}-startsAt`] && (
                      <p className="text-sm text-red-600">{errors[`session-${i}-startsAt`]}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Waktu Selesai</label>
                    <input
                      type="datetime-local"
                      value={session.endsAt}
                      onChange={(e) => updateSession(i, 'endsAt', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                        errors[`session-${i}-endsAt`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`session-${i}-endsAt`] && (
                      <p className="text-sm text-red-600">{errors[`session-${i}-endsAt`]}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Kapasitas</label>
                    <input
                      type="number"
                      min={1}
                      value={session.capacity}
                      onChange={(e) =>
                        updateSession(i, 'capacity', parseInt(e.target.value) || 1)
                      }
                      placeholder="10"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                        errors[`session-${i}-capacity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`session-${i}-capacity`] && (
                      <p className="text-sm text-red-600">{errors[`session-${i}-capacity`]}</p>
                    )}
                    <p className="text-xs text-gray-500">Jumlah maksimal peserta</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Nama Tipe Tiket</label>
                    <input
                      type="text"
                      value={session.ticketTypeName}
                      onChange={(e) => updateSession(i, 'ticketTypeName', e.target.value)}
                      placeholder="Regular"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                        errors[`session-${i}-ticketTypeName`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors[`session-${i}-ticketTypeName`] && (
                      <p className="text-sm text-red-600">
                        {errors[`session-${i}-ticketTypeName`]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={session.price}
                      onChange={(e) =>
                        updateSession(i, 'price', parseInt(e.target.value) || 0)
                      }
                      placeholder="50000"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                        errors[`session-${i}-price`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`session-${i}-price`] && (
                      <p className="text-sm text-red-600">{errors[`session-${i}-price`]}</p>
                    )}
                    <p className="text-xs text-gray-500">Harga dalam Rupiah (IDR)</p>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSession}
              className="self-start text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
            >
              + Tambah sesi
            </button>
          </div>
        </Card>

        {/* Result message */}
        {result && (
          <div
            className={`rounded-lg p-4 text-sm ${
              result.includes('✅')
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {result}
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={!partnerId}
          >
            Buat Listing
          </Button>
        </div>
      </form>
    </div>
  );
}
