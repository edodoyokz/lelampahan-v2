import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  children?: React.ReactNode;
}

export function PageHeader({ title, description, eyebrow, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-lelampahan-gold">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-lelampahan-earth">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {children}
      </div>
      {action && (
        <Link href={action.href}>
          <Button variant="primary" size="md">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
