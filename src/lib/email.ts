import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/** Escape user-supplied strings before embedding in HTML email bodies. */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const client = getResendClient();
  if (!client) {
    console.warn('Resend not configured — skipping email send');
    return { success: false };
  }

  const { data, error } = await client.emails.send({
    from: 'Lelampahan <noreply@lelampahan.id>',
    to: [input.to],
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    console.error('Failed to send email:', error);
    return { success: false };
  }

  return { success: true, messageId: data?.id };
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
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/account/tickets`;

  return sendEmail({
    to: input.to,
    subject: input.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Tiket Lelampahan</h1>
        <p>Halo <strong>${esc(input.participantName)}</strong>,</p>
        <p>Terima kasih sudah memesan <strong>${esc(input.listingTitle)}</strong>.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px"><strong>Order:</strong> ${esc(input.orderNumber)}</p>
          <p style="margin:0 0 8px"><strong>Tiket:</strong> ${esc(input.ticketCode)}</p>
          <a href="${ticketUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Lihat Tiket QR
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Simpan email ini atau akses tiket dari akun Anda kapan saja.</p>
      </div>
    `,
  });
}

export async function sendOrderExpiredEmail(input: {
  to: string;
  participantName: string;
  orderNumber: string;
  listingTitle: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const marketplaceUrl = `${baseUrl}/`;

  return sendEmail({
    to: input.to,
    subject: `Pesanan Kedaluwarsa — ${esc(input.listingTitle)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Pesanan Kedaluwarsa</h1>
        <p>Halo <strong>${esc(input.participantName)}</strong>,</p>
        <p>Pesanan Anda untuk <strong>${esc(input.listingTitle)}</strong> (${esc(input.orderNumber)}) telah kedaluwarsa karena pembayaran tidak diselesaikan dalam batas waktu.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px"><strong>Nomor Pesanan:</strong> ${esc(input.orderNumber)}</p>
          <p style="margin:0 0 8px">Jika Anda masih ingin memesan, silakan buat pesanan baru.</p>
          <a href="${marketplaceUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Jelajahi Pengalaman
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Jika ada pertanyaan, hubungi kami di support@lelampahan.id.</p>
      </div>
    `,
  });
}

export async function sendOrderCancelledEmail(input: {
  to: string;
  participantName: string;
  orderNumber: string;
  listingTitle: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const marketplaceUrl = `${baseUrl}/`;

  return sendEmail({
    to: input.to,
    subject: `Pesanan Dibatalkan — ${esc(input.listingTitle)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Pesanan Dibatalkan</h1>
        <p>Halo <strong>${esc(input.participantName)}</strong>,</p>
        <p>Pesanan Anda untuk <strong>${esc(input.listingTitle)}</strong> (${esc(input.orderNumber)}) telah berhasil dibatalkan.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px"><strong>Nomor Pesanan:</strong> ${esc(input.orderNumber)}</p>
          <a href="${marketplaceUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Jelajahi Pengalaman Lain
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Jika ada pertanyaan, hubungi kami di support@lelampahan.id.</p>
      </div>
    `,
  });
}

export async function sendPartnerRegistrationEmail(input: {
  to: string;
  partnerName: string;
  contactName: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

  return sendEmail({
    to: input.to,
    subject: `Pendaftaran Partner Diterima — ${esc(input.partnerName)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Pendaftaran Partner Diterima</h1>
        <p>Halo <strong>${esc(input.contactName)}</strong>,</p>
        <p>Terima kasih telah mendaftarkan <strong>${esc(input.partnerName)}</strong> di Lelampahan.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0 0 8px">Pendaftaran Anda sedang dalam proses review oleh tim kami.</p>
          <p style="margin:0 0 8px">Kami akan menghubungi Anda dalam 1–2 hari kerja.</p>
          <a href="${baseUrl}/partner" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Pantau Status Partner
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Jika ada pertanyaan, hubungi kami di support@lelampahan.id.</p>
      </div>
    `,
  });
}

export async function sendListingSubmittedEmail(input: {
  to: string;
  partnerName: string;
  listingTitle: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

  return sendEmail({
    to: input.to,
    subject: `Pengalaman Disubmit untuk Review — ${esc(input.listingTitle)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Pengalaman Disubmit</h1>
        <p>Halo <strong>${esc(input.partnerName)}</strong>,</p>
        <p>Pengalaman <strong>${esc(input.listingTitle)}</strong> berhasil disubmit dan sedang menunggu review admin.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <p style="margin:0">Kami akan meninjau pengalaman Anda dalam 1–2 hari kerja dan mengirimkan notifikasi hasilnya.</p>
          <a href="${baseUrl}/partner/listings" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px">
            Kelola Pengalaman
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Jika ada pertanyaan, hubungi kami di support@lelampahan.id.</p>
      </div>
    `,
  });
}

export async function sendListingApprovedEmail(input: {
  to: string;
  partnerName: string;
  listingTitle: string;
  listingSlug: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!input.to) return { success: false };

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const listingUrl = `${baseUrl}/l/${input.listingSlug}`;

  return sendEmail({
    to: input.to,
    subject: `Pengalaman Disetujui — ${esc(input.listingTitle)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#431407">Pengalaman Disetujui</h1>
        <p>Halo <strong>${esc(input.partnerName)}</strong>,</p>
        <p>Selamat! Pengalaman <strong>${esc(input.listingTitle)}</strong> telah disetujui dan kini tampil di marketplace Lelampahan.</p>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;margin:24px 0">
          <a href="${listingUrl}" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Lihat di Marketplace
          </a>
        </div>
        <p style="color:#78716c;font-size:13px">Jika ada pertanyaan, hubungi kami di support@lelampahan.id.</p>
      </div>
    `,
  });
}
