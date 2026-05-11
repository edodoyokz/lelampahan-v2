import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function CheckoutLoading() {
  return (
    <section
      className="mx-auto max-w-3xl px-6 py-16"
      role="status"
      aria-label="Memuat checkout"
    >
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <SkeletonLoader variant="text" lines={2} className="max-w-md" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </div>
    </section>
  );
}
