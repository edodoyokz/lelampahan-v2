import Link from 'next/link';

const placeholderListings = [
  { id: '1', title: 'Jelajah Kotagede Heritage', type: 'TOUR', status: 'PUBLISHED', sessions: 3 },
  { id: '2', title: 'Workshop Batik', type: 'EVENT', status: 'DRAFT', sessions: 1 },
];

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

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Judul</th>
              <th className="px-6 py-3 font-medium">Tipe</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Sesi</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {placeholderListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{listing.title}</td>
                <td className="px-6 py-4 text-gray-500">{listing.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : listing.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{listing.sessions}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/partner/listings/${listing.id}`}
                    className="text-sm font-medium text-lelampahan-gold hover:text-lelampahan-brick"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
