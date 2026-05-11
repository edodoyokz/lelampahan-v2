# Rencana Implementasi Perbaikan FE UI Dashboard

> Dokumen ini berisi rencana implementasi berdasarkan hasil audit UI dashboard semua role di Lelampahan v2.
> Disusun berdasarkan prioritas: High → Medium → Low.

---

## High Priority — Fungsional

### 1. Implementasi Edit Listing Form (`/partner/listings/[id]`)

**Status saat ini:** Halaman hanya menampilkan placeholder teks.

**Scope:**
- Fetch data listing existing dari API berdasarkan ID
- Reuse logic form dari `/partner/listings/new` (extract ke shared hook/component)
- Pre-populate semua field: judul, deskripsi, tipe, booking mode, cover image, itinerary, sessions
- Handle update via `PATCH /api/listing/[id]`
- Validasi sama seperti create form
- Tampilkan status listing saat ini (DRAFT/PENDING_REVIEW/PUBLISHED)
- Jika status PUBLISHED, tampilkan warning bahwa edit akan memerlukan re-review

**File yang perlu diubah/dibuat:**
- `app/partner/listings/[id]/page.tsx` — rewrite dari placeholder
- `src/hooks/use-listing-form.ts` — extract shared form state & logic
- `src/components/feature/listing-form.tsx` — shared form UI component
- `app/api/listing/[id]/route.ts` — endpoint GET & PATCH (jika belum ada)

**Estimasi effort:** 2-3 hari

---

### 2. Integrasi QR Scanning di Scanner Page

**Status saat ini:** Kamera aktif tapi tidak ada decoding. Validasi manual mode demo (setTimeout).

**Scope:**
- Install library `html5-qrcode` atau `@aspect-build/qr-scanner`
- Integrasikan scanner ke video feed yang sudah ada
- Pada scan berhasil, panggil `POST /api/partner/scanner/validate` dengan kode tiket
- Tampilkan hasil validasi (success/error) menggunakan UI feedback yang sudah ada
- Hubungkan validasi manual ke endpoint yang sama
- Tambahkan debounce agar tidak scan berulang untuk kode yang sama
- Handle permission denied gracefully

**File yang perlu diubah/dibuat:**
- `app/partner/scanner/page.tsx` — integrasi scanner library
- `app/api/partner/scanner/validate/route.ts` — endpoint validasi tiket
- `package.json` — tambah dependency scanner

**Estimasi effort:** 1-2 hari

---

### 3. Fetch Real Stats di Account Dashboard

**Status saat ini:** StatCard menampilkan hardcoded "0" untuk Total Pesanan, Tiket Aktif, Menunggu Pembayaran.

**Scope:**
- Buat endpoint `GET /api/account/stats` yang mengembalikan:
  - `totalOrders`: count orders milik user
  - `activeTickets`: count tiket dengan status VALID
  - `pendingPayment`: count orders dengan status PENDING_PAYMENT
- Panggil endpoint di `app/account/page.tsx` (server component, bisa langsung query)
- Atau langsung query via data layer (`findOrderCountByUser`, `findActiveTicketCount`)

**File yang perlu diubah/dibuat:**
- `app/account/page.tsx` — ganti hardcoded values dengan data real
- `src/data/order.ts` — tambah query functions jika belum ada
- `src/data/ticket.ts` — tambah count query

**Estimasi effort:** 0.5 hari

---

### 4. Pagination di DataTable

**Status saat ini:** DataTable menampilkan semua data tanpa pagination. Akan bermasalah saat data banyak.

**Scope:**
- Extend `DataTable` component dengan props pagination:
  - `page`, `pageSize`, `totalItems`, `onPageChange`
- Tambahkan pagination controls (Previous/Next + page indicator)
- Implementasi server-side pagination di API endpoints:
  - `GET /api/admin/partners?page=1&pageSize=20`
  - `GET /api/admin/listings?page=1&pageSize=20`
  - `GET /api/partner/[id]/listings?page=1&pageSize=20`
  - `GET /api/partner/bookings?page=1&pageSize=20`
- Update semua halaman yang menggunakan DataTable

**File yang perlu diubah/dibuat:**
- `src/components/ui/data-table.tsx` — tambah pagination UI
- `app/api/admin/partners/route.ts` — tambah query params
- `app/api/admin/listings/route.ts` — tambah query params
- `app/api/partner/[partnerId]/listings/route.ts` — tambah query params
- `app/api/partner/bookings/route.ts` — tambah query params
- Semua page yang consume DataTable — pass pagination props

**Estimasi effort:** 2 hari

---

### 5. Fix Footer Dead Links

**Status saat ini:** Semua link di footer mengarah ke `/` (Jelajahi, Tentang, Syarat & Ketentuan, Kebijakan Privasi).

**Scope:**
- Buat halaman static sederhana:
  - `/about` — Tentang Lelampahan
  - `/terms` — Syarat & Ketentuan
  - `/privacy` — Kebijakan Privasi
- Update href di `marketplace-footer.tsx`
- Konten bisa placeholder dulu tapi halaman harus exist

**File yang perlu diubah/dibuat:**
- `app/(marketplace)/about/page.tsx`
- `app/(marketplace)/terms/page.tsx`
- `app/(marketplace)/privacy/page.tsx`
- `src/components/layout/marketplace-footer.tsx` — update hrefs

**Estimasi effort:** 0.5 hari

---

## Medium Priority — UX

### 6. QR Code Visual di Halaman Tiket Customer

**Status saat ini:** Tiket hanya menampilkan kode teks (`ticket.code`). Tidak ada QR image.

**Scope:**
- Install `qrcode.react` atau `react-qr-code`
- Render QR code dari `ticket.code` di setiap tiket card
- QR harus cukup besar untuk di-scan (minimal 150x150px)
- Tambahkan instruksi "Tunjukkan QR ini saat check-in"

**File yang perlu diubah/dibuat:**
- `app/account/tickets/page.tsx` — tambah QR component
- `package.json` — tambah dependency

**Estimasi effort:** 0.5 hari

---

### 7. Search Input di Admin Pages

**Status saat ini:** Admin hanya bisa filter by status, tidak bisa search by nama/judul.

**Scope:**
- Tambahkan search input di atas DataTable pada:
  - `/admin/partners` — search by nama partner
  - `/admin/listings` — search by judul listing
- Filter client-side (data sudah di-load semua) atau server-side jika pagination sudah ada
- Debounce 300ms pada input

**File yang perlu diubah/dibuat:**
- `app/admin/partners/page.tsx` — tambah search state + filter logic
- `app/admin/listings/page.tsx` — tambah search state + filter logic
- Opsional: `src/components/ui/search-input.tsx` — reusable search component

**Estimasi effort:** 0.5 hari

---

### 8. Error Boundary & Loading States per Route Group

**Status saat ini:** Tidak ada `error.tsx` atau `loading.tsx` di route segments.

**Scope:**
- Buat `error.tsx` untuk setiap route group:
  - `app/admin/error.tsx`
  - `app/partner/error.tsx`
  - `app/account/error.tsx`
  - `app/(marketplace)/error.tsx`
- Buat `loading.tsx` untuk route groups yang fetch data server-side:
  - `app/account/loading.tsx`
  - `app/(marketplace)/l/[slug]/loading.tsx`
- Error page menampilkan pesan user-friendly + tombol retry
- Loading page menggunakan SkeletonLoader yang sudah ada

**File yang perlu dibuat:**
- `app/admin/error.tsx`
- `app/partner/error.tsx`
- `app/account/error.tsx`
- `app/(marketplace)/error.tsx`
- `app/account/loading.tsx`
- `app/account/tickets/loading.tsx`
- `app/account/orders/loading.tsx`

**Estimasi effort:** 1 hari

---

### 9. Filter Status di Partner Bookings

**Status saat ini:** Partner bookings page tidak punya filter status (berbeda dengan admin pages yang punya StatusFilterTabs).

**Scope:**
- Tambahkan `StatusFilterTabs` di bookings page dengan opsi:
  - Semua, Permintaan (REQUESTED), Menunggu Pembayaran (PENDING_PAYMENT), Disetujui, Selesai
- Filter data client-side (sama pattern dengan admin listings)

**File yang perlu diubah:**
- `app/partner/bookings/page.tsx` — tambah filter state + StatusFilterTabs

**Estimasi effort:** 0.5 hari

---

### 10. Multi-step Wizard untuk New Listing Form

**Status saat ini:** Form create listing sangat panjang (1 halaman scroll). 300+ baris state management.

**Scope:**
- Pecah form menjadi 3 step:
  1. Informasi Dasar (judul, deskripsi, tipe, booking mode, cover image)
  2. Detail Tour/Event (durasi, meeting point, itinerary, venue, included/excluded)
  3. Jadwal & Harga (sessions dengan waktu, kapasitas, harga)
- Tambahkan step indicator/progress bar di atas form
- Validasi per step sebelum lanjut ke step berikutnya
- Tombol "Sebelumnya" dan "Selanjutnya"
- Auto-save draft ke localStorage pada setiap perubahan
- Step terakhir menampilkan ringkasan sebelum submit

**File yang perlu diubah/dibuat:**
- `app/partner/listings/new/page.tsx` — refactor ke wizard
- `src/components/feature/listing-wizard/step-indicator.tsx`
- `src/components/feature/listing-wizard/step-basic-info.tsx`
- `src/components/feature/listing-wizard/step-details.tsx`
- `src/components/feature/listing-wizard/step-schedule.tsx`
- `src/hooks/use-listing-form.ts` — shared state management

**Estimasi effort:** 2-3 hari

---

## Low Priority — Polish

### 11. Konsistensi Bahasa (Full Bahasa Indonesia)

**Status saat ini:** Mayoritas UI Bahasa Indonesia, tapi ada campuran English.

**Yang perlu di-Indonesiakan:**
- "Order Number" → "Nomor Pesanan"
- "Request to Book" → "Permintaan Booking" atau "Ajukan Pemesanan"
- "Instant Confirmation" → "Konfirmasi Langsung"
- "Scanner" → "Pemindai" (sudah ada "Pemindai Tiket" di header, tapi nav masih "Scanner")
- Column headers: "Listing" → "Pengalaman"

**File yang perlu diubah:**
- `app/partner/bookings/page.tsx`
- `app/partner/listings/new/page.tsx`
- `src/components/layout/partner-shell.tsx` (nav label)

**Estimasi effort:** 0.5 hari

---

### 12. Migrasi `<img>` ke `next/image`

**Status saat ini:** Beberapa tempat menggunakan `<img>` langsung (cover image di listing detail, avatar, preview).

**Scope:**
- Ganti semua `<img>` dengan `<Image>` dari `next/image`
- Konfigurasi `next.config.js` untuk domain gambar external (Supabase storage)
- Tambahkan `width`, `height`, atau `fill` prop sesuai layout
- Benefit: lazy loading otomatis, format optimization (WebP/AVIF), responsive srcset

**File yang perlu diubah:**
- `app/(marketplace)/l/[slug]/page.tsx`
- `app/partner/listings/new/page.tsx` (preview)
- `src/components/layout/marketplace-header.tsx` (avatar)
- `src/components/feature/listing-card.tsx`
- `next.config.js` — tambah `images.remotePatterns`

**Estimasi effort:** 1 hari

---

### 13. Toast Notifications Setelah Aksi

**Status saat ini:** `ToastProvider` ada di marketplace layout tapi tidak digunakan di dashboard. Feedback hanya via inline message.

**Scope:**
- Extend `ToastProvider` ke semua layout (admin, partner, account)
- Tambahkan toast setelah:
  - Admin approve/reject partner atau listing
  - Partner submit listing, approve/reject booking
  - Customer berhasil checkout
- Buat hook `useToast()` untuk trigger dari client components
- Toast auto-dismiss setelah 5 detik

**File yang perlu diubah/dibuat:**
- `app/admin/layout.tsx` — wrap dengan ToastProvider
- `app/partner/layout.tsx` — wrap dengan ToastProvider
- `app/account/layout.tsx` — wrap dengan ToastProvider
- `src/components/ui/toast.tsx` — pastikan hook `useToast` tersedia
- Semua page dengan aksi — tambahkan toast call

**Estimasi effort:** 1 hari

---

### 14. Color Contrast Audit

**Status saat ini:** Custom colors (lelampahan-gold, lelampahan-brick, lelampahan-earth) belum diverifikasi WCAG compliance.

**Scope:**
- Audit semua kombinasi warna teks/background menggunakan tool contrast checker
- Fokus pada:
  - `text-lelampahan-gold` di atas `bg-white` (eyebrow text)
  - `text-white` di atas `bg-lelampahan-gold` (buttons)
  - `text-gray-400` helper text (mungkin terlalu light)
  - `text-white/80` di footer
- Adjust warna di `tailwind.config` jika ratio < 4.5:1 (AA standard)

**File yang perlu diubah:**
- `tailwind.config.ts` — adjust color values jika perlu
- Komponen yang menggunakan warna problematic

**Estimasi effort:** 0.5 hari

---

### 15. Image Gallery/Carousel di Listing Detail

**Status saat ini:** Hanya menampilkan 1 cover image meskipun listing bisa punya multiple images.

**Scope:**
- Buat `ImageGallery` component dengan:
  - Thumbnail strip di bawah main image
  - Click thumbnail untuk ganti main image
  - Opsional: lightbox/fullscreen view
  - Swipe gesture di mobile
- Integrasikan di listing detail page
- Fallback ke single image jika hanya ada 1

**File yang perlu dibuat/diubah:**
- `src/components/feature/image-gallery.tsx`
- `app/(marketplace)/l/[slug]/page.tsx` — ganti single image section

**Estimasi effort:** 1-2 hari

---

## Bonus: Improvement Tambahan (Future)

| Item | Deskripsi |
|------|-----------|
| Admin stats endpoint | `GET /api/admin/stats` — agregat server-side |
| Partner listing analytics | Tampilkan views, conversion rate per listing |
| Notification inbox | Badge count + dropdown notifikasi untuk semua role |
| Review/rating system | Customer bisa review setelah experience selesai |
| Partner profile page | `/p/[slug]` — public page partner dengan semua listing |
| Order detail page | `/account/orders/[id]` — detail + payment status + actions |
| Dark mode | Tailwind dark variant untuk semua komponen |
| PWA support | Offline-capable untuk scanner page |

---

## Timeline Estimasi

| Fase | Items | Durasi |
|------|-------|--------|
| Sprint 1 | High Priority #1-5 | 5-7 hari |
| Sprint 2 | Medium Priority #6-10 | 4-5 hari |
| Sprint 3 | Low Priority #11-15 | 3-4 hari |

**Total estimasi: ~2-3 minggu** (1 developer full-time)

---

*Dokumen ini dibuat: 11 Mei 2026*
*Berdasarkan audit codebase Lelampahan v2*
