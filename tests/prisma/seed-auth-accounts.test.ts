import { describe, expect, it, vi } from 'vitest';
import { createSeedAuthAccounts, seedAuthAccounts } from '../../prisma/seed-auth-accounts';

describe('seed auth accounts', () => {
  it('defines login-ready accounts for every app role and partner owner', () => {
    const accounts = createSeedAuthAccounts('Password123!');

    expect(accounts.map((account) => account.email)).toEqual([
      'customer@lelampahan.test',
      'admin@lelampahan.test',
      'superadmin@lelampahan.test',
      'partner@lelampahan.test',
    ]);
    expect(accounts.map((account) => account.role)).toEqual([
      'CUSTOMER',
      'ADMIN',
      'SUPER_ADMIN',
      'CUSTOMER',
    ]);
    expect(accounts.find((account) => account.email === 'partner@lelampahan.test')?.partnerOwner).toBe(true);
  });

  it('creates missing Supabase auth users with metadata and marks email confirmed', async () => {
    const listUsers = vi.fn().mockResolvedValue({ data: { users: [] }, error: null });
    const createUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'auth-user-1', email: 'customer@lelampahan.test' } },
      error: null,
    });

    const result = await seedAuthAccounts(
      {
        auth: {
          admin: {
            listUsers,
            createUser,
            updateUserById: vi.fn(),
          },
        },
      },
      [{ email: 'customer@lelampahan.test', password: 'Password123!', name: 'Citra Pelanggan', role: 'CUSTOMER' }],
    );

    expect(createUser).toHaveBeenCalledWith({
      email: 'customer@lelampahan.test',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { name: 'Citra Pelanggan', full_name: 'Citra Pelanggan', role: 'CUSTOMER' },
      app_metadata: { role: 'CUSTOMER' },
    });
    expect(result).toEqual([{ authUserId: 'auth-user-1', email: 'customer@lelampahan.test', created: true }]);
  });

  it('updates metadata for existing Supabase auth users without changing password', async () => {
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [{ id: 'existing-auth-id', email: 'admin@lelampahan.test' }] },
      error: null,
    });
    const updateUserById = vi.fn().mockResolvedValue({
      data: { user: { id: 'existing-auth-id', email: 'admin@lelampahan.test' } },
      error: null,
    });
    const createUser = vi.fn();

    const result = await seedAuthAccounts(
      {
        auth: {
          admin: {
            listUsers,
            createUser,
            updateUserById,
          },
        },
      },
      [{ email: 'admin@lelampahan.test', password: 'Password123!', name: 'Admin Lelampahan', role: 'ADMIN' }],
    );

    expect(createUser).not.toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith('existing-auth-id', {
      email_confirm: true,
      user_metadata: { name: 'Admin Lelampahan', full_name: 'Admin Lelampahan', role: 'ADMIN' },
      app_metadata: { role: 'ADMIN' },
    });
    expect(result).toEqual([{ authUserId: 'existing-auth-id', email: 'admin@lelampahan.test', created: false }]);
  });
});
