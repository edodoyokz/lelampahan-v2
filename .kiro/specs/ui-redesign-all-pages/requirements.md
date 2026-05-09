# Requirements Document

## Introduction

Dokumen ini mendefinisikan kebutuhan untuk redesain dan perbaikan UI frontend di seluruh halaman platform Lelampahan. Platform ini adalah marketplace Yogyakarta-first untuk tour, paket perjalanan, dan event. Redesain mencakup pembuatan shared component library, perbaikan visual di semua area (marketplace publik, auth, checkout, akun pengguna, portal partner, dan backoffice admin), serta penerapan konsisten dari arah visual "Modern Jogja Heritage" — warm, earth/brick/gold/cream palette, subtle batik accents, modern dan trustworthy.

## Glossary

- **Component_Library**: Kumpulan komponen UI yang dapat digunakan ulang (Button, Card, Input, Badge, Table, Modal, dll.) yang disimpan di direktori `src/components/ui`
- **Marketplace_Layout**: Layout wrapper untuk halaman publik marketplace termasuk header navigasi dan footer
- **Listing_Card**: Komponen kartu untuk menampilkan ringkasan listing (gambar, judul, harga, lokasi, tipe)
- **Skeleton_Loader**: Komponen placeholder animasi yang ditampilkan saat data sedang dimuat
- **Empty_State**: Komponen visual yang ditampilkan ketika tidak ada data untuk ditampilkan, dengan ilustrasi dan CTA
- **Status_Badge**: Komponen badge berwarna untuk menampilkan status (DRAFT, PENDING_REVIEW, PUBLISHED, dll.)
- **Sidebar_Navigation**: Komponen navigasi samping responsif untuk portal partner dan admin
- **Hero_Section**: Bagian utama di atas fold pada homepage dengan headline, search, dan visual
- **Category_Browser**: Komponen untuk menjelajahi listing berdasarkan kategori/tipe
- **Session_Picker**: Komponen untuk memilih jadwal/sesi pada halaman detail listing
- **Checkout_Flow**: Alur multi-step dari pemilihan sesi hingga pembayaran QRIS
- **Account_Shell**: Layout wrapper untuk halaman akun pengguna dengan sidebar navigasi
- **Data_Table**: Komponen tabel responsif dengan header, sorting visual, dan empty state
- **Toast_Notification**: Komponen notifikasi sementara untuk feedback aksi pengguna
- **Mobile_Drawer**: Komponen navigasi drawer untuk sidebar pada layar mobile

## Requirements

### Requirement 1: Shared Component Library

**User Story:** Sebagai developer, saya ingin memiliki shared component library yang konsisten, sehingga semua halaman menggunakan komponen yang sama dan mempercepat pengembangan UI.

#### Acceptance Criteria

1. THE Component_Library SHALL menyediakan komponen Button dengan varian primary (gold), secondary (outline), destructive (red), dan ghost
2. THE Component_Library SHALL menyediakan komponen Input dengan label, placeholder, error state, dan helper text
3. THE Component_Library SHALL menyediakan komponen Card dengan varian elevated (shadow) dan outlined (border)
4. THE Component_Library SHALL menyediakan komponen Status_Badge dengan warna yang sesuai untuk setiap status bisnis (success/green, warning/yellow, error/red, info/blue, neutral/gray)
5. THE Component_Library SHALL menyediakan komponen Skeleton_Loader untuk teks, gambar, card, dan tabel
6. THE Component_Library SHALL menyediakan komponen Empty_State dengan slot untuk ilustrasi, judul, deskripsi, dan CTA button
7. THE Component_Library SHALL menyediakan komponen Data_Table dengan header, row, dan empty state yang responsif
8. THE Component_Library SHALL menyediakan komponen Modal/Dialog untuk konfirmasi aksi
9. THE Component_Library SHALL menyediakan komponen Toast_Notification untuk feedback sukses, error, dan info
10. THE Component_Library SHALL menerapkan design token dari tema Lelampahan (cream, gold, brick, earth) secara konsisten di semua komponen

### Requirement 2: Marketplace Homepage

**User Story:** Sebagai pengunjung, saya ingin melihat homepage yang menarik dengan listing populer, pencarian, dan kategori, sehingga saya dapat menemukan tour dan event yang saya inginkan.

#### Acceptance Criteria

1. THE Hero_Section SHALL menampilkan headline, sub-headline, dan search bar untuk pencarian listing berdasarkan kata kunci
2. THE Hero_Section SHALL menampilkan visual background yang mencerminkan nuansa Yogyakarta heritage
3. WHEN pengunjung membuka homepage, THE Marketplace_Layout SHALL menampilkan grid Listing_Card dari listing yang berstatus PUBLISHED
4. THE Category_Browser SHALL menampilkan kategori listing (Tour, Event) dengan ikon dan label yang dapat diklik untuk memfilter
5. WHEN pengunjung mengklik kategori pada Category_Browser, THE Marketplace_Layout SHALL memfilter grid listing sesuai kategori yang dipilih
6. THE Listing_Card SHALL menampilkan gambar placeholder, judul, lokasi, tipe (Tour/Event), dan harga mulai dari
7. THE Marketplace_Layout SHALL menampilkan footer dengan informasi platform, link navigasi, dan kontak
8. WHILE data listing sedang dimuat, THE Marketplace_Layout SHALL menampilkan Skeleton_Loader berbentuk grid card
9. IF tidak ada listing yang tersedia, THEN THE Marketplace_Layout SHALL menampilkan Empty_State dengan pesan dan ilustrasi yang sesuai

### Requirement 3: Marketplace Header dan Navigasi

**User Story:** Sebagai pengunjung, saya ingin navigasi yang jelas dan responsif, sehingga saya dapat berpindah antar halaman dengan mudah.

#### Acceptance Criteria

1. THE Marketplace_Layout SHALL menampilkan header dengan logo Lelampahan, link navigasi utama (Home, Jelajahi, Akun Saya), dan tombol Login/Daftar
2. WHEN pengguna sudah login, THE Marketplace_Layout SHALL menampilkan avatar/nama pengguna menggantikan tombol Login/Daftar
3. WHEN layar berukuran mobile (di bawah 768px), THE Marketplace_Layout SHALL menampilkan hamburger menu yang membuka Mobile_Drawer
4. THE Marketplace_Layout SHALL menampilkan breadcrumb pada halaman detail listing

### Requirement 4: Listing Detail Page

**User Story:** Sebagai pengunjung, saya ingin melihat detail lengkap listing dengan gambar, deskripsi, jadwal, dan harga, sehingga saya dapat memutuskan untuk memesan.

#### Acceptance Criteria

1. THE Marketplace_Layout SHALL menampilkan galeri gambar listing di bagian atas halaman detail (placeholder jika belum ada gambar)
2. THE Marketplace_Layout SHALL menampilkan informasi listing termasuk judul, tipe, deskripsi lengkap, lokasi, dan durasi (untuk tour)
3. THE Session_Picker SHALL menampilkan daftar sesi tersedia dengan tanggal, waktu, kapasitas tersisa, dan harga per tipe tiket
4. WHEN pengunjung memilih sesi dan klik tombol Pesan, THE Marketplace_Layout SHALL mengarahkan pengunjung ke halaman checkout dengan parameter sesi yang dipilih
5. IF listing tidak memiliki sesi tersedia, THEN THE Session_Picker SHALL menampilkan pesan "Belum ada jadwal tersedia" dengan Empty_State
6. THE Marketplace_Layout SHALL menampilkan informasi partner/penyelenggara pada halaman detail listing
7. WHILE data listing sedang dimuat, THE Marketplace_Layout SHALL menampilkan Skeleton_Loader yang sesuai dengan layout halaman detail

### Requirement 5: Halaman Autentikasi (Login dan Register)

**User Story:** Sebagai pengunjung, saya ingin halaman login dan register yang menarik dan branded, sehingga saya merasa percaya untuk membuat akun.

#### Acceptance Criteria

1. THE Marketplace_Layout SHALL menampilkan halaman login dengan branding Lelampahan (logo, warna tema, tagline)
2. THE Marketplace_Layout SHALL menampilkan halaman login dalam layout split-screen dengan panel visual di sisi kiri dan form di sisi kanan pada desktop
3. WHEN layar berukuran mobile, THE Marketplace_Layout SHALL menampilkan form login full-width dengan branding di atas form
4. THE Marketplace_Layout SHALL menampilkan link navigasi antara halaman login dan register
5. THE Marketplace_Layout SHALL menampilkan form input dengan styling konsisten dari Component_Library (label, border focus state, error message)
6. WHEN form login gagal, THE Marketplace_Layout SHALL menampilkan pesan error yang jelas di bawah form dengan warna merah
7. THE Marketplace_Layout SHALL menampilkan halaman register dengan format dan styling yang konsisten dengan halaman login

### Requirement 6: Checkout Flow

**User Story:** Sebagai pengguna, saya ingin proses checkout yang jelas dan user-friendly tanpa perlu memasukkan ID manual, sehingga saya dapat menyelesaikan pemesanan dengan mudah.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL menampilkan ringkasan pesanan (nama listing, sesi yang dipilih, tipe tiket, jumlah, dan total harga) di bagian atas halaman
2. THE Checkout_Flow SHALL menampilkan form data peserta dengan input nama, email, dan nomor HP untuk setiap peserta
3. THE Checkout_Flow SHALL menampilkan tombol "Bayar dengan QRIS" yang jelas dan menonjol sebagai CTA utama
4. WHEN pembayaran QRIS berhasil dibuat, THE Checkout_Flow SHALL menampilkan QR code dalam card yang jelas dengan instruksi pembayaran dan countdown timer
5. WHEN countdown timer habis, THE Checkout_Flow SHALL menampilkan status expired dengan opsi untuk membuat pembayaran baru
6. THE Checkout_Flow SHALL menampilkan halaman pending dengan animasi loading dan instruksi menunggu konfirmasi
7. IF pembayaran gagal, THEN THE Checkout_Flow SHALL menampilkan halaman error dengan pesan yang jelas dan tombol untuk kembali atau mencoba lagi
8. WHILE proses checkout sedang berjalan, THE Checkout_Flow SHALL menampilkan loading state pada tombol submit

### Requirement 7: Account Section (Akun Pengguna)

**User Story:** Sebagai pengguna yang sudah login, saya ingin halaman akun yang terorganisir dengan navigasi sidebar, sehingga saya dapat mengakses pesanan dan tiket saya dengan mudah.

#### Acceptance Criteria

1. THE Account_Shell SHALL menampilkan sidebar navigasi dengan menu: Profil, Pesanan, Wallet Tiket
2. WHEN layar berukuran mobile, THE Account_Shell SHALL menampilkan navigasi sebagai tab horizontal di atas konten
3. THE Account_Shell SHALL menampilkan halaman Profil dengan informasi akun pengguna (nama, email)
4. THE Account_Shell SHALL menampilkan halaman Pesanan dengan daftar riwayat pesanan dalam format card (bukan tabel) yang menampilkan nama listing, tanggal, status, dan total
5. IF pengguna belum memiliki pesanan, THEN THE Account_Shell SHALL menampilkan Empty_State dengan ilustrasi dan tombol "Jelajahi Listing"
6. THE Account_Shell SHALL menampilkan halaman Wallet Tiket dengan daftar tiket QR yang sudah diterbitkan dalam format card
7. IF pengguna belum memiliki tiket, THEN THE Account_Shell SHALL menampilkan Empty_State dengan ilustrasi dan tombol "Jelajahi Listing"
8. WHILE data pesanan atau tiket sedang dimuat, THE Account_Shell SHALL menampilkan Skeleton_Loader

### Requirement 8: Partner Portal Layout dan Dashboard

**User Story:** Sebagai partner, saya ingin portal yang profesional dan responsif dengan navigasi yang jelas, sehingga saya dapat mengelola bisnis saya dengan efisien.

#### Acceptance Criteria

1. THE Sidebar_Navigation pada partner portal SHALL menampilkan menu: Dashboard, Listings, Pesanan, Scanner, dengan ikon dan label
2. WHEN layar berukuran mobile (di bawah 768px), THE Sidebar_Navigation SHALL berubah menjadi bottom navigation bar atau collapsible drawer
3. THE Sidebar_Navigation SHALL menandai menu aktif dengan highlight visual (background color dan font weight)
4. THE Partner Dashboard SHALL menampilkan stat cards (Listings Aktif, Pesanan Bulan Ini, Pendapatan Estimasi) dengan ikon dan warna yang sesuai
5. THE Partner Dashboard SHALL menampilkan section Aksi Cepat dengan card yang memiliki ikon, judul, dan deskripsi singkat
6. WHILE data dashboard sedang dimuat, THE Partner Dashboard SHALL menampilkan Skeleton_Loader pada stat cards

### Requirement 9: Partner Listings Management

**User Story:** Sebagai partner, saya ingin halaman manajemen listing yang informatif dan mudah digunakan, sehingga saya dapat membuat dan mengelola listing dengan cepat.

#### Acceptance Criteria

1. THE Data_Table pada halaman listings partner SHALL menampilkan kolom: Judul, Tipe, Status (dengan Status_Badge berwarna), Jumlah Sesi, dan Aksi
2. THE Data_Table SHALL responsif — pada mobile menampilkan format card list alih-alih tabel
3. THE Partner Portal SHALL menampilkan form pembuatan listing baru dengan section yang terorganisir (Informasi Dasar, Detail Tour/Event, Sesi & Harga) menggunakan card separator
4. THE Partner Portal SHALL menampilkan form input yang konsisten dengan Component_Library termasuk label, placeholder, dan validasi visual
5. IF partner belum memiliki listing, THEN THE Data_Table SHALL menampilkan Empty_State dengan tombol "Buat Listing Pertama"

### Requirement 10: Partner Bookings dan Scanner

**User Story:** Sebagai partner, saya ingin halaman pesanan dan scanner yang efisien untuk operasional harian, sehingga saya dapat memproses pesanan dan check-in peserta dengan cepat.

#### Acceptance Criteria

1. THE Data_Table pada halaman pesanan partner SHALL menampilkan kolom: Order Number, Pelanggan, Listing, Status (dengan Status_Badge), Total, dan Aksi
2. WHEN pesanan berstatus REQUESTED, THE Data_Table SHALL menampilkan tombol Setujui dan Tolak dengan konfirmasi dialog sebelum eksekusi
3. THE Partner Portal SHALL menampilkan halaman scanner dengan area kamera yang besar dan jelas pada mobile
4. WHEN scan berhasil memvalidasi tiket, THE Partner Portal SHALL menampilkan feedback visual besar berwarna hijau dengan informasi tiket
5. IF scan gagal atau tiket tidak valid, THEN THE Partner Portal SHALL menampilkan feedback visual besar berwarna merah dengan alasan kegagalan
6. THE Partner Portal SHALL menyediakan input manual kode tiket sebagai fallback di bawah area kamera

### Requirement 11: Admin Backoffice Layout dan Dashboard

**User Story:** Sebagai admin, saya ingin backoffice yang bersih dan efisien dengan navigasi yang jelas, sehingga saya dapat mengelola platform dengan cepat.

#### Acceptance Criteria

1. THE Sidebar_Navigation pada admin backoffice SHALL menampilkan menu: Dashboard, Partners, Listings, dengan ikon dan label
2. WHEN layar berukuran mobile (di bawah 768px), THE Sidebar_Navigation SHALL berubah menjadi collapsible drawer dengan hamburger toggle
3. THE Sidebar_Navigation SHALL menandai menu aktif dengan highlight visual
4. THE Admin Dashboard SHALL menampilkan stat cards (Total Partner, Total Listings, Pending Review, Revenue) dengan ikon dan warna yang sesuai
5. WHILE data dashboard sedang dimuat, THE Admin Dashboard SHALL menampilkan Skeleton_Loader pada stat cards

### Requirement 12: Admin Review Tables

**User Story:** Sebagai admin, saya ingin tabel review yang informatif dan mudah digunakan, sehingga saya dapat memproses approval partner dan listing dengan efisien.

#### Acceptance Criteria

1. THE Data_Table pada halaman partner approval SHALL menampilkan kolom: Nama, Deskripsi, Kapabilitas, Status (dengan Status_Badge), dan Aksi
2. THE Data_Table pada halaman listing review SHALL menampilkan kolom: Judul, Partner, Tipe, Sesi, Status (dengan Status_Badge), dan Aksi
3. WHEN admin mengklik tombol Approve atau Reject, THE Admin Backoffice SHALL menampilkan konfirmasi dialog sebelum eksekusi aksi
4. THE Data_Table SHALL responsif — pada mobile menampilkan format card list alih-alih tabel
5. IF tidak ada item yang perlu direview, THEN THE Data_Table SHALL menampilkan Empty_State dengan pesan "Tidak ada item yang menunggu review"
6. WHILE data tabel sedang dimuat, THE Data_Table SHALL menampilkan Skeleton_Loader berbentuk baris tabel

### Requirement 13: Responsive Design dan Mobile UX

**User Story:** Sebagai pengguna mobile, saya ingin semua halaman dapat diakses dan digunakan dengan nyaman di layar kecil, sehingga saya dapat menggunakan platform dari smartphone.

#### Acceptance Criteria

1. THE Marketplace_Layout SHALL menerapkan responsive breakpoints yang konsisten: mobile (<768px), tablet (768px-1024px), desktop (>1024px)
2. WHEN layar berukuran mobile, THE Marketplace_Layout SHALL menampilkan Listing_Card dalam layout single-column
3. WHEN layar berukuran tablet atau desktop, THE Marketplace_Layout SHALL menampilkan Listing_Card dalam layout grid 2-3 kolom
4. THE Checkout_Flow SHALL dapat digunakan sepenuhnya pada layar mobile tanpa horizontal scroll
5. THE Partner Portal scanner page SHALL dioptimalkan untuk penggunaan portrait pada mobile dengan area kamera yang memenuhi sebagian besar layar
6. WHEN layar berukuran mobile, THE Data_Table SHALL bertransformasi menjadi card list yang dapat di-scroll vertikal

### Requirement 14: Loading States dan Feedback Visual

**User Story:** Sebagai pengguna, saya ingin feedback visual yang jelas saat menunggu data atau setelah melakukan aksi, sehingga saya tahu apa yang sedang terjadi.

#### Acceptance Criteria

1. WHILE halaman sedang memuat data dari server, THE Component_Library SHALL menampilkan Skeleton_Loader yang sesuai dengan layout konten yang akan ditampilkan
2. WHEN pengguna melakukan aksi (submit form, approve, reject), THE Component_Library SHALL menampilkan loading spinner pada tombol yang diklik
3. WHEN aksi berhasil dilakukan, THE Toast_Notification SHALL menampilkan pesan sukses berwarna hijau selama 3 detik
4. WHEN aksi gagal dilakukan, THE Toast_Notification SHALL menampilkan pesan error berwarna merah dengan deskripsi masalah
5. THE Component_Library SHALL menampilkan disabled state pada tombol saat form sedang disubmit untuk mencegah double-click

### Requirement 15: Typography dan Spacing Consistency

**User Story:** Sebagai pengguna, saya ingin tampilan yang konsisten dan rapi di seluruh halaman, sehingga platform terasa profesional dan mudah dibaca.

#### Acceptance Criteria

1. THE Component_Library SHALL menerapkan typography scale yang konsisten: heading 1 (text-3xl/text-4xl bold), heading 2 (text-2xl semibold), heading 3 (text-lg semibold), body (text-base), small (text-sm), caption (text-xs)
2. THE Component_Library SHALL menerapkan spacing scale yang konsisten menggunakan kelipatan 4px (gap-1 hingga gap-16) untuk padding dan margin antar elemen
3. THE Component_Library SHALL menerapkan border-radius yang konsisten: small (rounded-md), medium (rounded-lg), large (rounded-xl), full (rounded-full untuk badge dan avatar)
4. THE Component_Library SHALL menerapkan shadow scale yang konsisten: none, sm (card ringan), md (card elevated), lg (modal/dropdown)
5. THE Marketplace_Layout SHALL menggunakan max-width container yang konsisten: prose content (max-w-4xl), grid content (max-w-6xl), full-width sections (max-w-7xl)
