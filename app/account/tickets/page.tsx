import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/lib/supabase/client';
import { findTicketsByUser } from '@/data/ticket';
import { redirect } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default async function TicketWalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const tickets = await findTicketsByUser(user.id);

  return (
    <div>
      <PageHeader title="Tiket Saya" description="Tiket QR dari pesanan yang sudah dibayar akan muncul di sini." />
      <div className="mt-4 rounded-xl border border-lelampahan-gold/20 bg-lelampahan-cream/70 p-4 text-sm text-lelampahan-earth">
        Tunjukkan QR code ini saat check-in di lokasi pengalaman.
      </div>

      <div className="mt-6">
        {tickets.length === 0 ? (
          <EmptyState
            illustration={<Ticket className="h-12 w-12 text-gray-400" strokeWidth={1.6} aria-hidden="true" />}
            title="Belum ada tiket"
            description="Tiket QR dari pesanan yang sudah dibayar akan muncul di sini."
            action={{ label: 'Jelajahi Pengalaman', href: '/' }}
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const listing = ticket.order.session.listing;
              const session = ticket.order.session;
              const ticketTypeName = ticket.order.items[0]?.ticketType?.name ?? 'Tiket';

              return (
                <Card key={ticket.id} variant="outlined" padding="md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-lelampahan-earth">{listing.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startsAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{ticketTypeName}</p>
                      <StatusBadge status={getStatusVariant(ticket.status)} label={ticket.status} />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-xl border border-dashed border-lelampahan-gold bg-white p-3">
                        <QRCodeSVG
                          value={ticket.code}
                          size={150}
                          level="M"
                          includeMargin
                        />
                      </div>
                      <p className="font-mono text-xs text-gray-500">{ticket.code}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
