import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError } from '@/domain/shared/errors';

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

export async function parseBody(request: Request): Promise<unknown> {
  return request.json().catch(() => {
    throw new DomainError('INVALID_JSON', 'Invalid JSON body');
  });
}
