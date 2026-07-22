import { resolve } from "node:path";

import { config } from "dotenv";

// The worker shares environment with the web app. Load apps/web/.env.local so a
// single .env file drives both processes in local development.
config({ path: resolve(import.meta.dirname, "../../../apps/web/.env.local") });
config(); // fall back to a local .env if present

// pg-boss needs a session-mode (direct) connection — the pooled transaction-mode
// URL (pgbouncer) does not support LISTEN/NOTIFY or prepared statements.
export function getQueueConnectionString(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DIRECT_URL (or DATABASE_URL) must be set for the worker.");
  }
  return url;
}

// pg-boss / node-postgres config for the Supabase pooler. Recent pg-connection-string
// versions treat `sslmode=require` as `verify-full`, which rejects Supabase's pooler
// certificate ("self-signed certificate in certificate chain"). We keep TLS on but skip
// CA verification (standard for the Supabase pooler) and strip the sslmode query param so
// it does not re-impose verification. See supabase pooler + node-postgres SSL notes.
export function getQueueConfig(): {
  connectionString: string;
  ssl: { rejectUnauthorized: false };
} {
  const raw = getQueueConnectionString();
  let connectionString = raw;
  try {
    const parsed = new URL(raw);
    parsed.searchParams.delete("sslmode");
    connectionString = parsed.toString();
  } catch {
    // Leave the raw string untouched if it is not a parseable URL.
  }
  return { connectionString, ssl: { rejectUnauthorized: false } };
}
