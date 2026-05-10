import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in browser (client) components.
 * Uses the SSR-compatible browser client from @supabase/ssr.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
