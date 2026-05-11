import Link from 'next/link';
import { Card } from '@/components/ui/card';

export interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Link href={href} className="block">
      <Card variant="outlined" padding="md" className="h-full transition hover:-translate-y-0.5 hover:border-lelampahan-gold hover:shadow-md">
        <div className="flex items-start gap-4">
          {icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lelampahan-cream text-lelampahan-gold">{icon}</div>}
          <div>
            <h3 className="font-semibold text-lelampahan-earth">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
