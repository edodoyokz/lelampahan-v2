export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export interface MidtransQrisPaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface MidtransQrisPaymentResult {
  transactionDetails: {
    orderId: string;
    grossAmount: number;
  };
  paymentMethod: 'qris';
  customerDetails: {
    firstName: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  callbacks: {
    finish: string;
    error: string;
    pending: string;
  };
  expiry: {
    startTime: string;
    duration: number;
    unit: 'minutes';
  };
}

export function createMidtransQrisPayment(
  input: MidtransQrisPaymentInput,
): MidtransQrisPaymentResult {
  const now = new Date();
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

  return {
    transactionDetails: {
      orderId: input.orderNumber,
      grossAmount: input.amount,
    },
    paymentMethod: 'qris',
    customerDetails: {
      firstName: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    itemDetails: input.itemDetails.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    callbacks: {
      finish: `${baseUrl}/account/orders`,
      error: `${baseUrl}/checkout/error`,
      pending: `${baseUrl}/checkout/pending`,
    },
    expiry: {
      startTime: now.toISOString(),
      duration: 30,
      unit: 'minutes',
    },
  };
}
