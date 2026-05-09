export interface OrderItemData {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutOrder {
  orderNumber: string;
  userId: string;
  sessionId: string;
  status: 'PENDING_PAYMENT';
  totalAmount: number;
  items: OrderItemData[];
}

export interface BookingRequest {
  orderNumber: string;
  userId: string;
  sessionId: string;
  status: 'REQUESTED' | 'PARTNER_APPROVED' | 'PARTNER_REJECTED' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'EXPIRED' | 'PAYMENT_EXPIRED' | 'REFUND_REQUESTED';
  totalAmount: number;
  items: OrderItemData[];
  userMessage?: string;
}

export function createInstantCheckout(input: {
  userId: string;
  sessionId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderNumber: string;
}): CheckoutOrder {
  if (input.quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  return {
    orderNumber: input.orderNumber,
    userId: input.userId,
    sessionId: input.sessionId,
    status: 'PENDING_PAYMENT',
    totalAmount: input.totalAmount,
    items: [
      {
        ticketTypeId: input.ticketTypeId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        subtotal: input.totalAmount,
      },
    ],
  };
}

export function createBookingRequest(input: {
  userId: string;
  sessionId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderNumber: string;
  message?: string;
}): BookingRequest {
  if (input.quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  return {
    orderNumber: input.orderNumber,
    userId: input.userId,
    sessionId: input.sessionId,
    status: 'REQUESTED',
    totalAmount: input.totalAmount,
    items: [
      {
        ticketTypeId: input.ticketTypeId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        subtotal: input.totalAmount,
      },
    ],
    userMessage: input.message,
  };
}
