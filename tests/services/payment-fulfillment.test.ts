import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOrderById: vi.fn(),
  issueTicketsAndNotify: vi.fn(),
}));

vi.mock('@/data/booking', () => ({
  findOrderById: mocks.findOrderById,
}));

vi.mock('@/services/ticket-notification', () => ({
  issueTicketsAndNotify: mocks.issueTicketsAndNotify,
}));

import { fulfillPaidOrder } from '@/services/payment-fulfillment';

describe('payment fulfillment', () => {
  it('issues tickets for paid order participants when no tickets exist', async () => {
    mocks.findOrderById.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      tickets: [],
      participants: [
        { name: 'Budi', email: 'budi@example.com', phone: '0811' },
        { name: 'Siti', email: 'siti@example.com', phone: '0812' },
      ],
      session: { listing: { title: 'Jelajah Kotagede' } },
    });
    mocks.issueTicketsAndNotify.mockResolvedValue({ tickets: [{ id: 't1' }, { id: 't2' }], emailsSent: 2 });

    const result = await fulfillPaidOrder({
      orderId: 'order-1',
      tokenSecret: 'secret-at-least-16-chars',
    });

    expect(result.ticketsIssued).toBe(2);
    expect(result.emailsSent).toBe(2);
    expect(mocks.issueTicketsAndNotify).toHaveBeenCalledWith({
      orderId: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      listingTitle: 'Jelajah Kotagede',
      participants: [
        { name: 'Budi', email: 'budi@example.com', phone: '0811' },
        { name: 'Siti', email: 'siti@example.com', phone: '0812' },
      ],
      tokenSecret: 'secret-at-least-16-chars',
    });
  });

  it('does not issue duplicate tickets when tickets already exist', async () => {
    mocks.findOrderById.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      tickets: [{ id: 'ticket-1' }],
      participants: [{ name: 'Budi', email: 'budi@example.com', phone: '0811' }],
      session: { listing: { title: 'Jelajah Kotagede' } },
    });

    const result = await fulfillPaidOrder({
      orderId: 'order-1',
      tokenSecret: 'secret-at-least-16-chars',
    });

    expect(result.ticketsIssued).toBe(0);
    expect(result.skipped).toBe('tickets_already_issued');
  });
});
