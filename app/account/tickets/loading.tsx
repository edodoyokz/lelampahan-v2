import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function TicketsLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-8 w-48" />
        <SkeletonLoader variant="text" className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        <SkeletonLoader variant="card" className="h-32" />
        <SkeletonLoader variant="card" className="h-32" />
      </div>
    </div>
  );
}
