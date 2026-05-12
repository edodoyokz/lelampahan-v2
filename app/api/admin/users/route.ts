import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { UserRole } from '@prisma/client';
import { requireApiSuperAdmin } from '@/lib/auth/api';
import { handleApiError, parseBody } from '@/lib/errors';
import { recordAuditLog } from '@/data/audit';

const DEFAULT_PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    const auth = await requireApiSuperAdmin(request);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10));
    const skip = (page - 1) * pageSize;

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' as const } },
            { name: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.userProfile.count({ where }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    return handleApiError(error);
  }
}

const roleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(UserRole),
});

export async function PATCH(request: Request) {
  try {
    const auth = await requireApiSuperAdmin(request);
    if (auth.response) return auth.response;

    const body = await parseBody(request);
    const input = roleUpdateSchema.parse(body);

    // Prevent super admin from demoting themselves
    const actorProfile = await prisma.userProfile.findUnique({
      where: { authUserId: auth.user.id },
      select: { id: true },
    });
    if (actorProfile?.id === input.userId && input.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 },
      );
    }

    const updated = await prisma.userProfile.update({
      where: { id: input.userId },
      data: { role: input.role },
      select: { id: true, email: true, name: true, role: true },
    });

    await recordAuditLog({
      actorUserId: auth.user.id,
      action: 'user.role_updated',
      entityType: 'UserProfile',
      entityId: input.userId,
      metadata: { newRole: input.role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
