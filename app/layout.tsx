import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Lelampahan — Pengalaman Lokal Yogyakarta',
    template: '%s | Lelampahan',
  },
  description: 'Temukan tur, workshop, dan acara lokal Yogyakarta dengan booking online, pembayaran QRIS, dan tiket QR.',
  openGraph: {
    title: 'Lelampahan — Pengalaman Lokal Yogyakarta',
    description: 'Temukan pengalaman lokal Yogyakarta dari partner terpercaya.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Lelampahan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lelampahan — Pengalaman Lokal Yogyakarta',
    description: 'Marketplace pengalaman lokal Yogyakarta.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
