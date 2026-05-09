import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  partnerId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  type: z.enum(['TOURS', 'EVENTS']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = actionSchema.parse(body);

    return NextResponse.json({
      partnerId: input.partnerId,
      action: input.action,
      status: input.action === 'approve' ? 'APPROVED' : 'REJECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
