import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userUpsert: vi.fn(),
  membershipUpsert: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    userProfile: { upsert: mocks.userUpsert },
    partnerMembership: { upsert: mocks.membershipUpsert },
  },
}));

import { ensurePartnerOwnerMembership } from '@/data/partner';

describe('partner owner membership', () => {
  it('upserts user profile and owner membership for auth user', async () => {
    mocks.userUpsert.mockResolvedValueOnce({ id: 'profile-1' });
    mocks.membershipUpsert.mockResolvedValueOnce({ id: 'membership-1' });

    await expect(
      ensurePartnerOwnerMembership({
        authUserId: 'auth-1',
        email: 'owner@example.com',
        name: 'Owner',
        partnerId: 'partner-1',
      }),
    ).resolves.toEqual({ id: 'membership-1' });

    expect(mocks.userUpsert).toHaveBeenCalledWith({
      where: { authUserId: 'auth-1' },
      create: { authUserId: 'auth-1', email: 'owner@example.com', name: 'Owner' },
      update: { email: 'owner@example.com', name: 'Owner' },
    });
    expect(mocks.membershipUpsert).toHaveBeenCalledWith({
      where: { partnerId_userId: { partnerId: 'partner-1', userId: 'profile-1' } },
      create: { partnerId: 'partner-1', userId: 'profile-1', role: 'OWNER' },
      update: { role: 'OWNER' },
    });
  });
});
