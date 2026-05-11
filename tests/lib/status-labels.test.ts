import { describe, expect, it } from 'vitest';
import {
  formatListingStatusLabel,
  formatOrderStatusLabel,
  formatPartnerStatusLabel,
  formatTicketStatusLabel,
} from '@/lib/status-labels';

describe('status label helpers', () => {
  it('formats known statuses in Indonesian', () => {
    expect(formatListingStatusLabel('PENDING_REVIEW')).toBe('Menunggu Review');
    expect(formatPartnerStatusLabel('APPROVED')).toBe('Disetujui');
    expect(formatOrderStatusLabel('PENDING_PAYMENT')).toBe('Menunggu Pembayaran');
    expect(formatTicketStatusLabel('ISSUED')).toBe('Terbit');
  });

  it('falls back to raw status for unknown values', () => {
    expect(formatOrderStatusLabel('CUSTOM_STATUS')).toBe('CUSTOM_STATUS');
  });
});
