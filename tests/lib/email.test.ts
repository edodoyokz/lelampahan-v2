import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = process.env;

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null });

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: sendMock };
    },
  };
});

import { sendTicketEmail } from '@/lib/email';

describe('email service', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    sendMock.mockClear();
  });

  it('sends a ticket email with correct parameters', async () => {
    const result = await sendTicketEmail({
      to: 'budi@example.com',
      subject: 'Tiket Lelampahan Anda',
      ticketCode: 'TICKET-001',
      orderNumber: 'LM-20260509-ABCD',
      participantName: 'Budi Santoso',
      listingTitle: 'Jelajah Kotagede Heritage',
      qrToken: 'v1.abc.signature',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('email-123');
  });

  it('throws on missing recipient', async () => {
    await expect(
      sendTicketEmail({
        to: '',
        subject: 'Test',
        ticketCode: 'TICKET-001',
        orderNumber: 'LM-001',
        participantName: 'Test',
        listingTitle: 'Test',
        qrToken: 'token',
      }),
    ).rejects.toThrow('Email recipient is required');
  });
});
