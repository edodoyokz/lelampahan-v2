export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Partner</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listings</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-lelampahan-earth">Rp0</p>
        </div>
      </div>
    </div>
  );
}
