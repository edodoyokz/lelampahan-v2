import Link from 'next/link';

export default function ListingManagement() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-lelampahan-earth">Listings</h1>
        <Link
          href="/partner/listings/new"
          className="rounded-lg bg-lelampahan-gold px-4 py-2 text-sm font-medium text-white hover:bg-lelampahan-brick"
        >
          + Listing Baru
        </Link>
      </div>
      <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
        <p>Belum ada listing. Buat listing pertama Anda.</p>
      </div>
    </div>
  );
}
