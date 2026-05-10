import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findPendingPaymentOrderForUser } from '@/data/payment';
import { ensureUserProfileForAuthUser } from '@/data/user';
import { simulatePakasirPayment } from '@/domain/payment/pakasir';
import { DomainError } from '@/domain/shared/errors';
import { requireApiUser } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';

const simulationSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request);
    if (auth.response) return auth.response;

    if (process.env.PAKASIR_MODE !== 'sandbox') {
      return NextResponse.json({ error: 'Pakasir simulation is only available in sandbox mode' }, { status: 403 });
    }

    const projectSlug = process.env.PAKASIR_PROJECT_SLUG;
    const apiKey = process.env.PAKASIR_API_KEY;
    if (!projectSlug || !apiKey) {
      throw new DomainError('PAKASIR_CONFIG_MISSING', 'Pakasir configuration is incomplete');
    }

    const body = await parseBody(request);
    const input = simulationSchema.parse(body);
    const profile = await ensureUserProfileForAuthUser({
      authUserId: auth.user.id,
      email: auth.user.email,
      name:
        typeof auth.user.user_metadata?.full_name === 'string'
          ? auth.user.user_metadata.full_name
          : typeof auth.user.user_metadata?.name === 'string'
            ? auth.user.user_metadata.name
            : null,
    });

    const order = await findPendingPaymentOrderForUser(input.orderId, profile.id);
    if (!order) {
      throw new DomainError('ORDER_NOT_PAYABLE', 'Order is not payable');
    }

    const result = await simulatePakasirPayment({
      projectSlug,
      apiKey,
      mode: 'sandbox',
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
