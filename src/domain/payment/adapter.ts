export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): CreatePaymentResult;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  idempotencyKey: string;
  orderNumber: string;
}

export interface CreatePaymentResult {
  provider: string;
  providerRef: string;
  method: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  expiresAt: Date;
  qrString: string;
}
