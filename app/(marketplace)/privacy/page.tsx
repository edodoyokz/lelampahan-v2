import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi dan perlindungan data pengguna Lelampahan.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Kebijakan Privasi</h1>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          Lelampahan menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan,
          menggunakan, dan melindungi informasi pribadi Anda.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">1. Data yang Kami Kumpulkan</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Informasi akun: nama, alamat email, nomor telepon</li>
          <li>Data pemesanan: riwayat transaksi, detail partisipan, preferensi pengalaman</li>
          <li>Data penggunaan: interaksi dengan platform, preferensi browsing</li>
        </ul>

        <h2 className="text-xl font-semibold text-lelampahan-earth">2. Penggunaan Data</h2>
        <p>
          Data Anda digunakan untuk memproses pemesanan, mengirim notifikasi terkait transaksi,
          meningkatkan kualitas layanan, dan keperluan komunikasi seputar akun Anda.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">3. Perlindungan Data</h2>
        <p>
          Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi
          data pribadi Anda dari akses tidak sah, perubahan, pengungkapan, atau perusakan.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">4. Hak Anda</h2>
        <p>
          Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja melalui
          pengaturan akun. Untuk pertanyaan lebih lanjut, hubungi kami di{' '}
          <a href="mailto:info@lelampahan.com" className="text-lelampahan-gold hover:text-lelampahan-brick underline">
            info@lelampahan.com
          </a>.
        </p>

        <p className="text-sm text-gray-500 italic">
          Terakhir diperbarui: 11 Mei 2026
        </p>
      </div>
    </main>
  );
}
