import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function ListingDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <SkeletonLoader variant="card" className="h-96" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonLoader variant="text" className="h-8 w-3/4" />
          <SkeletonLoader variant="text" className="h-4 w-full" />
          <SkeletonLoader variant="text" className="h-4 w-full" />
          <SkeletonLoader variant="text" className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <SkeletonLoader variant="card" className="h-48" />
          <SkeletonLoader variant="card" className="h-32" />
        </div>
      </div>
    </div>
  );
}
