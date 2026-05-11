import { Card } from '@/components/ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
}

export function StatCard({ label, value, helper, icon, iconClassName = 'bg-lelampahan-cream text-lelampahan-gold' }: StatCardProps) {
  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-4">
        {icon && <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}>{icon}</div>}
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-lelampahan-earth">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
        </div>
      </div>
    </Card>
  );
}
