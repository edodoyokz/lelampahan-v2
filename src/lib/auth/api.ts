import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canAccessAdminRoute, getUserRole } from '@/lib/auth/roles';

export function parseCookieHeader(cookieHeader: string | null): Array<{ name: string; value: string }> {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...valueParts] = part.split('=');
      return { name, value: decodeURIComponent(valueParts.join('=')) };
    })
    .filter((cookie) => Boolean(cookie.name));
}

export async function getApiUser(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('cookie'));
        },
        setAll() {
          // API route auth only reads incoming cookies.
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireApiUser(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, response: null };
}

export async function requireApiAdmin(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!canAccessAdminRoute(getUserRole(user))) {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, response: null };
}
