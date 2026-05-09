import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendTicketEmail(input: {
  to: string;
  subject: string;
  ticketCode: string;
  orderNumber: string;
  participantName: string;
  listingTitle: string;
  qrToken: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) {
    throw new Error('Email recipient is required');
  }

  const client = getResendClient();
  if (!client) {
    console.warn('Resend not configured — skipping email send');
    return { success: false };
  }

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/account/tickets`;

  const { data, error } = await client.emails.send({
    from: 'Lelampahan <noreply@lelampahan.id>',
    to: [input.to],
    subject: input.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Tiket Lelampahan</h1>
        <p>Halo <strong>${input.participantName}</strong>,</p>
        <p>Terima kasih sudah memesan <strong>${input.listingTitle}</strong>.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px"><strong>Order:</strong> ${input.orderNumber}</p>
          <p style="margin:0 0 8px"><strong>Tiket:</strong> ${input.ticketCode}</p>
          <a href="${ticketUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Lihat Tiket QR
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Simpan email ini atau akses tiket dari akun Anda kapan saja.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    return { success: false };
  }

  return { success: true, messageId: data?.id };
}
