import { readFile } from "node:fs/promises";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client for the worker to upload rendered media to
// Storage. The worker loads apps/web/.env.local (see src/env.ts), so it shares
// the same Supabase project + service role key as the web app.
export function createStorageClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getMediaBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "media";
}

// Uploads a local file to the media bucket and returns its storage path and
// public URL. The bucket is created (idempotently) so this works out of the box.
export async function uploadFile(params: {
  localPath: string;
  storagePath: string;
  contentType: string;
}): Promise<{ storagePath: string; url: string }> {
  const client = createStorageClient();
  const bucket = getMediaBucket();
  await client.storage.createBucket(bucket, { public: true }).catch(() => {});

  const body = await readFile(params.localPath);
  const { error } = await client.storage
    .from(bucket)
    .upload(params.storagePath, body, {
      contentType: params.contentType,
      upsert: true,
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(params.storagePath);
  return { storagePath: params.storagePath, url: data.publicUrl };
}

// Uploads an in-memory buffer (used for the Satori-rendered thumbnail).
export async function uploadBuffer(params: {
  buffer: Buffer;
  storagePath: string;
  contentType: string;
}): Promise<{ storagePath: string; url: string }> {
  const client = createStorageClient();
  const bucket = getMediaBucket();
  await client.storage.createBucket(bucket, { public: true }).catch(() => {});

  const { error } = await client.storage
    .from(bucket)
    .upload(params.storagePath, params.buffer, {
      contentType: params.contentType,
      upsert: true,
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(params.storagePath);
  return { storagePath: params.storagePath, url: data.publicUrl };
}
