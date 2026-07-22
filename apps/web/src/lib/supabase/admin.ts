import "server-only";

import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client for server-only tasks such as uploading generated
// media to Storage. NEVER import this into client components — the service role
// key must never reach the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getMediaBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "media";
}
