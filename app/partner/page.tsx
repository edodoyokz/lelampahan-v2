export default function PartnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Dashboard Partner</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings Aktif</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pesanan Baru</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pendapatan (Estimasi)</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp0</p>
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Dashboard akan terhubung ke database pada implementasi berikutnya.
      </p>
    </div>
  );
}
