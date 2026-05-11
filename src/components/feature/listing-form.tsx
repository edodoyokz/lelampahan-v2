'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ClipboardList, Compass, X } from 'lucide-react';
import { useListingForm, type ListingFormData } from '@/hooks/use-listing-form';
import { formatBookingModeLabel, formatListingTypeLabel } from '@/lib/status-labels';

interface ListingFormProps {
  form: ReturnType<typeof useListingForm>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitLabel?: string;
}

export function ListingForm({ form, onSubmit, submitLabel = 'Buat Listing' }: ListingFormProps) {
  const {
    type, setType,
    bookingMode, setBookingMode,
    title, setTitle,
    description, setDescription,
    coverPreviewUrl,
    duration, setDuration,
    meetingPoint, setMeetingPoint,
    venue, setVenue,
    itinerary,
    included, setIncluded,
    excluded, setExcluded,
    sessions,
    submitting,
    result,
    errors,
    listingStatus,
    addItineraryItem,
    removeItineraryItem,
    updateItinerary,
    addSession,
    removeSession,
    updateSession,
    handleCoverImageChange,
    partnerId,
  } = form;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Status Warning for Published Listings */}
      {listingStatus === 'PUBLISHED' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Perhatian:</strong> Pengalaman ini sudah dipublikasikan. Setelah diedit, pengalaman perlu
          ditinjau ulang sebelum perubahan tampil di marketplace.
        </div>
      )}

      {/* Section 1: Informasi Dasar */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-lg font-semibold text-lelampahan-earth">Informasi Dasar</h2>
        <p className="mt-1 text-sm text-gray-500">Isi informasi utama yang akan dilihat calon peserta.</p>

        <div className="mt-6 flex flex-col gap-5">
          <Input
            label="Judul Pengalaman"
            placeholder="Contoh: Jelajah Kotagede Heritage"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="listing-description" className="text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              id="listing-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan pengalaman, aktivitas, dan hal penting yang perlu diketahui peserta."
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
              <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                <Image
                  src={coverPreviewUrl}
                  alt="Preview cover pengalaman"
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            {errors.coverImage && <p className="text-sm text-red-600">{errors.coverImage}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Jenis Pengalaman</label>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => setType('TOUR')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'TOUR'
                    ? 'bg-lelampahan-gold text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                {formatListingTypeLabel('TOUR')}
              </button>
              <button
                type="button"
                onClick={() => setType('EVENT')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'EVENT'
                    ? 'bg-lelampahan-gold text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {formatListingTypeLabel('EVENT')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Cara Booking</label>
            <div className="mt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setBookingMode('INSTANT_CONFIRMATION')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  bookingMode === 'INSTANT_CONFIRMATION'
                    ? 'bg-lelampahan-gold text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {formatBookingModeLabel('INSTANT_CONFIRMATION')}
              </button>
              <button
                type="button"
                onClick={() => setBookingMode('REQUEST_TO_BOOK')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  bookingMode === 'REQUEST_TO_BOOK'
                    ? 'bg-lelampahan-gold text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                {formatBookingModeLabel('REQUEST_TO_BOOK')}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {bookingMode === 'INSTANT_CONFIRMATION'
                ? 'Pesanan otomatis diterima setelah pembayaran berhasil.'
                : 'Anda perlu menyetujui pesanan sebelum peserta dapat membayar.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Section 2: Detail Tour/Event */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-lg font-semibold text-lelampahan-earth">
          Detail {type === 'TOUR' ? 'Tur' : 'Acara'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {type === 'TOUR'
            ? 'Informasi khusus untuk tur Anda.'
            : 'Informasi khusus untuk acara Anda.'}
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
                        <X className="h-4 w-4" aria-hidden="true" />
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
              label="Lokasi Acara"
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

      {/* Section 3: Jadwal & Harga */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-lg font-semibold text-lelampahan-earth">Jadwal & Harga</h2>
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
                    onChange={(e) => updateSession(i, 'capacity', parseInt(e.target.value) || 1)}
                    placeholder="10"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                      errors[`session-${i}-capacity`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`session-${i}-capacity`] && (
                    <p className="text-sm text-red-600">{errors[`session-${i}-capacity`]}</p>
                  )}
                  <p className="text-xs text-gray-500">Kapasitas maksimal peserta</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nama Tipe Tiket</label>
                  <input
                    type="text"
                    value={session.ticketTypeName}
                    onChange={(e) => updateSession(i, 'ticketTypeName', e.target.value)}
                    placeholder="Regular"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lelampahan-gold/50 focus:border-lelampahan-gold ${
                      errors[`session-${i}-ticketTypeName`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`session-${i}-ticketTypeName`] && (
                    <p className="text-sm text-red-600">{errors[`session-${i}-ticketTypeName`]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={session.price}
                    onChange={(e) => updateSession(i, 'price', parseInt(e.target.value) || 0)}
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
            result.startsWith('Pengalaman berhasil')
              ? 'border border-green-200 bg-green-50 text-green-800'
              : result.startsWith('Perubahan berhasil')
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
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
