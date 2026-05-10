import { prisma } from '@/db/prisma';
import { DomainError } from '@/domain/shared/errors';

export async function ensureUserProfileForAuthUser(input: {
  authUserId: string;
  email?: string | null;
  name?: string | null;
}) {
  if (!input.email) {
    throw new DomainError('AUTH_EMAIL_REQUIRED', 'Authenticated user email is required');
  }

  return prisma.userProfile.upsert({
    where: { authUserId: input.authUserId },
    create: {
      authUserId: input.authUserId,
      email: input.email,
      name: input.name,
    },
    update: {
      email: input.email,
      name: input.name,
    },
  });
}
