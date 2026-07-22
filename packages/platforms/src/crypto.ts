import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// AES-256-GCM encryption for platform OAuth tokens. Tokens are NEVER stored in
// plaintext and NEVER sent to the client (per postpylot-core.mdc). The key is
// derived from TOKEN_ENCRYPTION_SECRET.

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_SECRET is not set.");
  }
  // 32-byte key regardless of secret length.
  return createHash("sha256").update(secret).digest();
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted token.");
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

// Optional helpers so callers don't sprinkle null-checks everywhere.
export function encryptNullable(value: string | null | undefined): string | null {
  return value ? encryptToken(value) : null;
}

export function decryptNullable(value: string | null | undefined): string | null {
  return value ? decryptToken(value) : null;
}
