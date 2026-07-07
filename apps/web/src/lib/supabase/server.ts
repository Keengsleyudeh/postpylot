import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Cookie writes are best-effort: Server Components cannot set
 * cookies during render, so `setAll` failures there are safe to ignore —
 * session refresh is handled by `proxy.ts` on every request instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — ignore.
            // Session refresh is handled in proxy.ts.
          }
        },
      },
    }
  );
}
