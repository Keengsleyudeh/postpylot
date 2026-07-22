import { NextResponse, type NextRequest } from "next/server";

import { prisma, type Platform, type Prisma } from "@postpylot/db";
import {
  decodeState,
  encryptNullable,
  encryptToken,
  getPlatformService,
} from "@postpylot/platforms";
import { isPlatform } from "@postpylot/shared";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";

// Handles the OAuth callback: verifies the signed state, exchanges the code for
// tokens, and stores them ENCRYPTED. Tokens never leave the server.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const origin = request.nextUrl.origin;
  const accountsUrl = (query: string) =>
    new URL(`/dashboard/accounts?${query}`, origin);

  if (!isPlatform(platform)) {
    return NextResponse.redirect(accountsUrl("error=unknown_platform"));
  }

  const params_ = request.nextUrl.searchParams;
  if (params_.get("error")) {
    return NextResponse.redirect(accountsUrl("error=access_denied"));
  }

  const code = params_.get("code");
  const stateRaw = params_.get("state");
  if (!code || !stateRaw) {
    return NextResponse.redirect(accountsUrl("error=missing_code"));
  }

  const state = decodeState(stateRaw);
  if (!state || state.platform !== platform) {
    return NextResponse.redirect(accountsUrl("error=invalid_state"));
  }

  const user = await getDashboardUser();
  if (user.id !== state.userId) {
    return NextResponse.redirect(accountsUrl("error=state_mismatch"));
  }

  const service = getPlatformService(platform);
  const redirectUri = new URL(
    `/api/platforms/${platform}/callback`,
    origin
  ).toString();

  const result = await service.exchangeCode({ code, redirectUri });
  if (result.status !== "ok") {
    const reason =
      result.status === "unsupported" ? result.reason : result.error;
    return NextResponse.redirect(
      accountsUrl(`error=${encodeURIComponent(reason)}`)
    );
  }

  const { tokens, account } = result.data;

  await prisma.platformAccount.upsert({
    where: {
      userId_platform_externalId: {
        userId: user.id,
        platform: platform as Platform,
        externalId: account.externalId,
      },
    },
    create: {
      userId: user.id,
      platform: platform as Platform,
      status: "connected",
      accountName: account.accountName,
      externalId: account.externalId,
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptNullable(tokens.refreshToken),
      tokenExpiresAt: tokens.expiresAt ?? null,
      scopes: tokens.scopes,
      metadata: (account.metadata ?? undefined) as Prisma.InputJsonValue,
    },
    update: {
      status: "connected",
      accountName: account.accountName,
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptNullable(tokens.refreshToken),
      tokenExpiresAt: tokens.expiresAt ?? null,
      scopes: tokens.scopes,
      metadata: (account.metadata ?? undefined) as Prisma.InputJsonValue,
    },
  });

  return NextResponse.redirect(accountsUrl(`connected=${platform}`));
}
