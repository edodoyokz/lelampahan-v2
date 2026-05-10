import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/supabase/client';
import { findTicketsByUser } from '@/data/ticket';
import { redirect } from 'next/navigation';

function TicketsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} variant="outlined" padding="md">
          <SkeletonLoader variant="text" lines={4} />
        </Card>
      ))}
    </div>
  );
}

async function TicketsList() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const tickets = await findTicketsByUser(user.id);

  if (tickets.length === 0) {
    return (
      <EmptyState
        illustration={<span className="text-5xl">🎫</span>}
        title="Belum ada tiket"
        description="Tiket QR yang sudah dibeli akan muncul di sini."
        action={{ label: 'Jelajahi Listing', href: '/' }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const listing = ticket.order.session.listing;
        const session = ticket.order.session;
        const ticketTypeName =
          ticket.order.items[0]?.ticketType?.name ?? 'Tiket';

        return (
          <Card key={ticket.id} variant="outlined" padding="md">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-lelampahan-earth">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(session.startsAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">{ticketTypeName}</p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <StatusBadge
                  status={getStatusVariant(ticket.status)}
                  label={ticket.status}
                />
                <span className="text-xs text-gray-400 font-mono">
                  {ticket.code}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function TicketWalletPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-lelampahan-earth">
        Wallet Tiket
      </h1>
      <div className="mt-6">
        <Suspense fallback={<TicketsLoading />}>
          <TicketsList />
        </Suspense>
      </div>
    </div>
  );
}
