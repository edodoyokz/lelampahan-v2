const listingLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Menunggu Review',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PUBLISHED: 'Terbit',
  ARCHIVED: 'Diarsipkan',
};

const partnerLabels: Record<string, string> = listingLabels;

const orderLabels: Record<string, string> = {
  DRAFT: 'Draft',
  REQUESTED: 'Permintaan',
  PARTNER_APPROVED: 'Disetujui Partner',
  PARTNER_REJECTED: 'Ditolak Partner',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  COMPLETED: 'Selesai',
  EXPIRED: 'Kedaluwarsa',
  PAYMENT_EXPIRED: 'Pembayaran Kedaluwarsa',
  CANCELLED: 'Dibatalkan',
  REFUND_REQUESTED: 'Pengembalian Dana Diajukan',
  REFUND_REJECTED: 'Pengembalian Dana Ditolak',
  PARTIALLY_REFUNDED: 'Sebagian Dana Dikembalikan',
  REFUNDED: 'Dana Dikembalikan',
  NEEDS_ADMIN_REVIEW: 'Ditinjau Admin',
};

const ticketLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  ISSUED: 'Terbit',
  CHECKED_IN: 'Sudah Check-in',
  CANCELLED: 'Dibatalkan',
  REFUNDED: 'Dana Dikembalikan',
  VOID: 'Tidak Berlaku',
};

const listingTypeLabels: Record<string, string> = {
  TOUR: 'Tur',
  EVENT: 'Acara',
};

const bookingModeLabels: Record<string, string> = {
  INSTANT_CONFIRMATION: 'Konfirmasi Langsung',
  REQUEST_TO_BOOK: 'Permintaan Booking',
};

function labelFrom(map: Record<string, string>, status: string) {
  return map[status] ?? status;
}

export function formatListingStatusLabel(status: string) {
  return labelFrom(listingLabels, status);
}

export function formatPartnerStatusLabel(status: string) {
  return labelFrom(partnerLabels, status);
}

export function formatOrderStatusLabel(status: string) {
  return labelFrom(orderLabels, status);
}

export function formatTicketStatusLabel(status: string) {
  return labelFrom(ticketLabels, status);
}

export function formatListingTypeLabel(type: string) {
  return labelFrom(listingTypeLabels, type);
}

export function formatBookingModeLabel(mode: string) {
  return labelFrom(bookingModeLabels, mode);
}
