import { NextResponse } from 'next/server';
import { listAuditLogs } from '@/data/audit';
import { requireApiSuperAdmin } from '@/lib/auth/api';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const auth = await requireApiSuperAdmin(request);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') ?? undefined;
    const entityType = searchParams.get('entityType') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)));

    const result = await listAuditLogs({ action, entityType, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
