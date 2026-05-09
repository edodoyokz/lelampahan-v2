import { issueTicket } from '@/domain/ticket/service';
import { createTicket } from '@/data/ticket';
import { sendTicketEmail } from '@/lib/email';

export async function issueTicketsAndNotify(input: {
  orderId: string;
  orderNumber: string;
  listingTitle: string;
  participants: Array<{ name: string; email: string; phone: string }>;
  tokenSecret: string;
}): Promise<{ tickets: Array<{ code: string; id: string }>; emailsSent: number }> {
  const tickets: Array<{ code: string; id: string }> = [];
  let emailsSent = 0;

  for (let i = 0; i < input.participants.length; i++) {
    const participant = input.participants[i];
    const ticketCode = `${input.orderNumber}-${String(i + 1).padStart(3, '0')}`;

    const domainTicket = issueTicket({
      orderId: input.orderId,
      code: ticketCode,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
      tokenSecret: input.tokenSecret,
    });

    const persisted = await createTicket({
      orderId: input.orderId,
      code: ticketCode,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
    });

    const emailResult = await sendTicketEmail({
      to: participant.email,
      subject: `Tiket Lelampahan — ${input.listingTitle}`,
      ticketCode,
      orderNumber: input.orderNumber,
      participantName: participant.name,
      listingTitle: input.listingTitle,
      qrToken: domainTicket.token,
    });

    tickets.push({ code: ticketCode, id: persisted.id });
    if (emailResult.success) emailsSent++;
  }

  return { tickets, emailsSent };
}
