import { createHmac, timingSafeEqual } from "node:crypto";

import type { Platform } from "@postpylot/shared";

// Signed OAuth `state` to defend against CSRF on the connect callback. The
// payload carries the user and platform; the HMAC is verified before we trust
// any callback (per postpylot-security in the rules).

export type OAuthState = {
  userId: string;
  platform: Platform;
  nonce: string;
};

function secret(): string {
  const value = process.env.TOKEN_ENCRYPTION_SECRET;
  if (!value) {
    throw new Error("TOKEN_ENCRYPTION_SECRET is not set.");
  }
  return value;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function encodeState(state: Omit<OAuthState, "nonce">): string {
  const full: OAuthState = {
    ...state,
    nonce: Math.random().toString(36).slice(2),
  };
  const payloadB64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function decodeState(raw: string): OAuthState | null {
  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as OAuthState;
  } catch {
    return null;
  }
}
