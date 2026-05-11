import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function AccountLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-8 w-64" />
        <SkeletonLoader variant="text" className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </div>
      <SkeletonLoader variant="card" className="h-64" />
    </div>
  );
}
