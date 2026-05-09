import { describe, expect, it, vi } from 'vitest';
import { issueTicketsAndNotify } from '@/services/ticket-notification';

const tokenSecret = 'dev-secret-32-bytes-long-abcdef1234';

vi.mock('@/lib/email', () => ({
  sendTicketEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'email-123' }),
}));

vi.mock('@/data/ticket', () => ({
  createTicket: vi.fn().mockImplementation((data) => ({
    ...data,
    id: 'ticket-generated',
    status: 'ISSUED',
  })),
}));

describe('ticket notification service', () => {
  it('issues tickets and sends emails for each participant', async () => {
    const result = await issueTicketsAndNotify({
      orderId: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      listingTitle: 'Jelajah Kotagede',
      participants: [
        { name: 'Budi', email: 'budi@example.com', phone: '0811' },
        { name: 'Siti', email: 'siti@example.com', phone: '0812' },
      ],
      tokenSecret,
    });

    expect(result.tickets).toHaveLength(2);
    expect(result.emailsSent).toBe(2);
  });

  it('returns empty result for zero participants', async () => {
    const result = await issueTicketsAndNotify({
      orderId: 'order-2',
      orderNumber: 'LM-20260509-EFGH',
      listingTitle: 'Test',
      participants: [],
      tokenSecret,
    });

    expect(result.tickets).toHaveLength(0);
    expect(result.emailsSent).toBe(0);
  });
});
