import { Prisma } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function recordAuditLog(input: {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listAuditLogs(options?: {
  action?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}) {
  const { action, entityType, page = 1, pageSize = 50 } = options ?? {};
  const where = {
    ...(action ? { action: { contains: action, mode: 'insensitive' as const } } : {}),
    ...(entityType ? { entityType } : {}),
  };
  const normalizedWhere = Object.keys(where).length > 0 ? where : undefined;
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: normalizedWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where: normalizedWhere }),
  ]);

  return { logs, total };
}
