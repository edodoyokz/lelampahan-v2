import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    userProfile: { findUnique: mocks.userFindUnique },
  },
}));

import { findPartnerContextByAuthUserId } from '@/data/partner';

describe('partner context lookup', () => {
  it('resolves partner context from Supabase auth user id', async () => {
    mocks.userFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      authUserId: 'auth-1',
      memberships: [
        {
          id: 'membership-1',
          role: 'OWNER',
          partner: { id: 'partner-1', name: 'Jogja Partner', status: 'APPROVED' },
        },
      ],
    });

    await expect(findPartnerContextByAuthUserId('auth-1')).resolves.toEqual({
      userProfileId: 'user-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-1', name: 'Jogja Partner', status: 'APPROVED' },
    });

    expect(mocks.userFindUnique).toHaveBeenCalledWith({
      where: { authUserId: 'auth-1' },
      include: {
        memberships: {
          include: { partner: { include: { capabilities: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  });

  it('returns null when user has no partner membership', async () => {
    mocks.userFindUnique.mockResolvedValueOnce({ id: 'user-1', memberships: [] });

    await expect(findPartnerContextByAuthUserId('auth-1')).resolves.toBeNull();
  });
});
