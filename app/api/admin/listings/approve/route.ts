import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, parseBody } from '@/lib/errors';

const actionSchema = z.object({
  listingId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
});

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const input = actionSchema.parse(body);

    return NextResponse.json({
      listingId: input.listingId,
      action: input.action,
      status: input.action === 'approve' ? 'PUBLISHED' : 'REJECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
