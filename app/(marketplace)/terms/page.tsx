import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan platform Lelampahan.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Syarat & Ketentuan</h1>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          Dengan menggunakan platform Lelampahan, Anda menyetujui syarat dan ketentuan berikut.
          Mohon baca dengan saksama sebelum menggunakan layanan kami.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">1. Penggunaan Platform</h2>
        <p>
          Lelampahan menyediakan platform untuk menghubungkan penyedia pengalaman (Partner) dengan
          peserta (Pengguna). Kami bertindak sebagai perantara dan tidak bertanggung jawab langsung
          atas pelaksanaan pengalaman yang diselenggarakan oleh Partner.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">2. Pendaftaran Akun</h2>
        <p>
          Pengguna wajib mendaftar akun untuk melakukan pemesanan. Informasi yang diberikan harus
          akurat dan terkini. Pengguna bertanggung jawab penuh atas kerahasiaan akun mereka.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">3. Pembayaran & Refund</h2>
        <p>
          Pembayaran diproses melalui mitra pembayaran kami. Kebijakan refund mengikuti ketentuan
          yang ditetapkan oleh masing-masing Partner, kecuali untuk pembatalan dari pihak Lelampahan.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">4. Tanggung Jawab Partner</h2>
        <p>
          Partner bertanggung jawab penuh atas akurasi informasi pengalaman, ketersediaan sesi,
          dan pelaksanaan pengalaman sesuai dengan yang dijanjikan.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">5. Perubahan Ketentuan</h2>
        <p>
          Lelampahan berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan
          diinformasikan melalui platform.
        </p>

        <p className="text-sm text-gray-500 italic">
          Terakhir diperbarui: 11 Mei 2026
        </p>
      </div>
    </main>
  );
}
