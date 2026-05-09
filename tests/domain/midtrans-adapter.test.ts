import { describe, expect, it } from 'vitest';
import { createMidtransQrisPayment } from '@/domain/payment/midtrans';

describe('Midtrans QRIS adapter', () => {
  it('generates a payment request with correct structure', () => {
    const result = createMidtransQrisPayment({
      orderId: 'order-1',
      orderNumber: 'LM-20260509-ABCD',
      amount: 100000,
      customer: {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
      },
      itemDetails: [
        { name: 'Ticket Regular', quantity: 2, price: 50000 },
      ],
    });

    expect(result.transactionDetails.orderId).toBe('LM-20260509-ABCD');
    expect(result.transactionDetails.grossAmount).toBe(100000);
    expect(result.paymentMethod).toBe('qris');
    expect(result.customerDetails.firstName).toBe('Budi Santoso');
  });

  it('calculates gross amount from item details', () => {
    const result = createMidtransQrisPayment({
      orderId: 'order-2',
      orderNumber: 'LM-20260509-EFGH',
      amount: 150000,
      customer: { name: 'Siti', email: 'siti@example.com', phone: '0811' },
      itemDetails: [
        { name: 'VIP Ticket', quantity: 1, price: 100000 },
        { name: 'Reg Ticket', quantity: 1, price: 50000 },
      ],
    });

    expect(result.transactionDetails.grossAmount).toBe(150000);
    expect(result.itemDetails).toHaveLength(2);
  });
});
