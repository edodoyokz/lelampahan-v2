import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function OrdersLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-8 w-48" />
        <SkeletonLoader variant="text" className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        <SkeletonLoader variant="card" className="h-24" />
        <SkeletonLoader variant="card" className="h-24" />
        <SkeletonLoader variant="card" className="h-24" />
      </div>
    </div>
  );
}
