import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userUpsert: vi.fn(),
}));

vi.mock('@/db/prisma', () => ({
  prisma: {
    userProfile: { upsert: mocks.userUpsert },
  },
}));

import { ensureUserProfileForAuthUser } from '@/data/user';

describe('ensureUserProfileForAuthUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts profile by Supabase auth user id and returns UserProfile id', async () => {
    mocks.userUpsert.mockResolvedValueOnce({ id: 'profile-1', authUserId: 'auth-1' });

    await expect(
      ensureUserProfileForAuthUser({
        authUserId: 'auth-1',
        email: 'user@example.com',
        name: 'User',
      }),
    ).resolves.toEqual({ id: 'profile-1', authUserId: 'auth-1' });

    expect(mocks.userUpsert).toHaveBeenCalledWith({
      where: { authUserId: 'auth-1' },
      create: { authUserId: 'auth-1', email: 'user@example.com', name: 'User' },
      update: { email: 'user@example.com', name: 'User' },
    });
  });

  it('rejects authenticated users without an email before creating orders', async () => {
    await expect(
      ensureUserProfileForAuthUser({ authUserId: 'auth-1', email: null }),
    ).rejects.toThrow('Authenticated user email is required');

    expect(mocks.userUpsert).not.toHaveBeenCalled();
  });
});
