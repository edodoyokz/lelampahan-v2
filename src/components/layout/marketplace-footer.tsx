import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="bg-lelampahan-earth text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Platform Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Lelampahan</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Marketplace lokal untuk menemukan tur, workshop, dan acara Yogyakarta dari partner terpercaya.
            </p>
          </div>

          {/* Navigasi */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Jelajahi Pengalaman
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Tentang Lelampahan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Kontak
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/80">info@lelampahan.com</li>
              <li>
                <a
                  href="#"
                  className="text-white/80 transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 transition-colors hover:text-white"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/60">
          &copy; {new Date().getFullYear()} Lelampahan. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
