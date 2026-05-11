import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { findListingById } from '@/data/listing';
import { findPartnerContextByAuthUserId } from '@/data/partner';
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

export async function requireApiSuperAdmin(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (getUserRole(user) !== 'SUPER_ADMIN') {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, response: null };
}

export async function requireApiPartnerContext(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.response || !auth.user) return { user: null, context: null, response: auth.response };

  const context = await findPartnerContextByAuthUserId(auth.user.id);
  if (!context) {
    return {
      user: auth.user,
      context: null,
      response: NextResponse.json({ error: 'Partner membership not found' }, { status: 404 }),
    };
  }

  return { user: auth.user, context, response: null };
}

export async function requirePartnerOwnership(request: Request, partnerId: string) {
  const auth = await requireApiPartnerContext(request);
  if (auth.response || !auth.context) return auth;

  if (auth.context.partner.id !== partnerId) {
    return {
      user: auth.user,
      context: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireListingOwnership(request: Request, listingId: string) {
  const auth = await requireApiPartnerContext(request);
  if (auth.response || !auth.context) return { ...auth, listing: null };

  const listing = await findListingById(listingId);
  if (!listing) {
    return {
      user: auth.user,
      context: auth.context,
      listing: null,
      response: NextResponse.json({ error: 'Listing not found' }, { status: 404 }),
    };
  }

  if (listing.partnerId !== auth.context.partner.id) {
    return {
      user: auth.user,
      context: null,
      listing: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ...auth, listing };
}
