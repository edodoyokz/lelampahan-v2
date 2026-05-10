import type { UserRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

export interface SeedAuthAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  partnerOwner?: boolean;
}

export interface SeededAuthAccount {
  authUserId: string;
  email: string;
  created: boolean;
}

interface SupabaseAdminClientLike {
  auth: {
    admin: {
      listUsers(input?: { page?: number; perPage?: number }): Promise<{
        data: { users: Array<{ id: string; email?: string | null }> };
        error: Error | null;
      }>;
      createUser(input: {
        email: string;
        password: string;
        email_confirm: boolean;
        user_metadata: Record<string, unknown>;
        app_metadata: Record<string, unknown>;
      }): Promise<{ data: { user: { id: string; email?: string | null } | null }; error: Error | null }>;
      updateUserById(
        id: string,
        input: {
          email_confirm: boolean;
          user_metadata: Record<string, unknown>;
          app_metadata: Record<string, unknown>;
        },
      ): Promise<{ data: { user: { id: string; email?: string | null } | null }; error: Error | null }>;
    };
  };
}

function authMetadataFor(account: SeedAuthAccount) {
  return {
    user_metadata: {
      name: account.name,
      full_name: account.name,
      role: account.role,
    },
    app_metadata: {
      role: account.role,
    },
  };
}

export function createSeedAuthAccounts(password = process.env.SEED_AUTH_PASSWORD ?? 'Password123!'): SeedAuthAccount[] {
  return [
    {
      email: 'customer@lelampahan.test',
      password,
      name: 'Citra Pelanggan',
      role: 'CUSTOMER',
    },
    {
      email: 'admin@lelampahan.test',
      password,
      name: 'Admin Lelampahan',
      role: 'ADMIN',
    },
    {
      email: 'superadmin@lelampahan.test',
      password,
      name: 'Super Admin Lelampahan',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'partner@lelampahan.test',
      password,
      name: 'Partner Jogja Adventure',
      role: 'CUSTOMER',
      partnerOwner: true,
    },
  ];
}

export function createSeedSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function seedAuthAccounts(
  supabase: SupabaseAdminClientLike,
  accounts = createSeedAuthAccounts(),
): Promise<SeededAuthAccount[]> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const existingByEmail = new Map(
    data.users
      .filter((user): user is { id: string; email: string } => typeof user.email === 'string')
      .map((user) => [user.email.toLowerCase(), user]),
  );

  const seeded: SeededAuthAccount[] = [];

  for (const account of accounts) {
    const metadata = authMetadataFor(account);
    const existing = existingByEmail.get(account.email.toLowerCase());

    if (existing) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        ...metadata,
      });
      if (updateError) throw updateError;

      seeded.push({ authUserId: existing.id, email: account.email, created: false });
      continue;
    }

    const { data: createdData, error: createError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      ...metadata,
    });
    if (createError) throw createError;
    if (!createdData.user) throw new Error(`Supabase did not return created user for ${account.email}`);

    seeded.push({ authUserId: createdData.user.id, email: account.email, created: true });
  }

  return seeded;
}
