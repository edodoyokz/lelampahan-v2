export default function PartnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <p className="mt-1 text-sm text-gray-500">Selamat datang di portal partner Lelampahan.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings Aktif</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pesanan Bulan Ini</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pendapatan (Estimasi)</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp 0</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-lelampahan-earth">Aksi Cepat</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="/partner/listings/new"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold"
        >
          <h3 className="font-semibold text-lelampahan-earth">Buat Listing Baru</h3>
          <p className="mt-1 text-sm text-gray-500">Tambahkan tour atau event baru</p>
        </a>
        <a
          href="/partner/listings"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:border-lelampahan-gold"
        >
          <h3 className="font-semibold text-lelampahan-earth">Kelola Listings</h3>
          <p className="mt-1 text-sm text-gray-500">Lihat dan edit listing yang sudah ada</p>
        </a>
      </div>
    </div>
  );
}
