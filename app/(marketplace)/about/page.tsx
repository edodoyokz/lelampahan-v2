import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Lelampahan',
  description: 'Pelajari lebih lanjut tentang Lelampahan — marketplace lokal untuk menemukan tur, workshop, dan acara Yogyakarta.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-lelampahan-earth">Tentang Lelampahan</h1>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          Lelampahan adalah marketplace lokal yang menghubungkan pencari pengalaman dengan penyedia tur,
          workshop, dan acara di Yogyakarta. Kami percaya bahwa setiap perjalanan memiliki cerita, dan
          setiap cerita layak untuk dijelajahi.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">Misi Kami</h2>
        <p>
          Memberdayakan komunitas lokal Yogyakarta dengan menyediakan platform yang memudahkan
          promosi dan penjualan pengalaman budaya, petualangan, dan kreatif — sambil memberikan
          kemudahan bagi wisatawan untuk menemukan aktivitas autentik.
        </p>

        <h2 className="text-xl font-semibold text-lelampahan-earth">Untuk Siapa?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Pencari Pengalaman</strong> — Temukan tur heritage, workshop batik, cooking class, dan berbagai aktivitas unik.</li>
          <li><strong>Partner Lokal</strong> — Para pelaku wisata, seniman, dan kreator yang ingin menjangkau lebih banyak peserta.</li>
        </ul>

        <h2 className="text-xl font-semibold text-lelampahan-earth">Hubungi Kami</h2>
        <p>
          Punya pertanyaan atau masukan? Jangan ragu untuk menghubungi kami di{' '}
          <a href="mailto:info@lelampahan.com" className="text-lelampahan-gold hover:text-lelampahan-brick underline">
            info@lelampahan.com
          </a>.
        </p>
      </div>
    </main>
  );
}
