import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Lelampahan — Tour & Event Yogyakarta',
    template: '%s | Lelampahan',
  },
  description: 'Marketplace tour, paket perjalanan, dan event Yogyakarta dengan pembayaran QRIS dan tiket QR.',
  openGraph: {
    title: 'Lelampahan — Tour & Event Yogyakarta',
    description: 'Temukan pengalaman wisata, paket perjalanan, dan event lokal Yogyakarta.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Lelampahan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lelampahan — Tour & Event Yogyakarta',
    description: 'Marketplace tour, paket perjalanan, dan event Yogyakarta.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
