import { NextResponse, type NextRequest } from "next/server";

import { encodeState, getPlatformService } from "@postpylot/platforms";
import { isPlatform } from "@postpylot/shared";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";

// Starts the platform publishing OAuth flow (separate from app SSO). Builds a
// signed `state` for CSRF protection and redirects to the provider.
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

  if (!process.env.TOKEN_ENCRYPTION_SECRET) {
    return NextResponse.redirect(accountsUrl("error=encryption_not_configured"));
  }

  const user = await getDashboardUser();
  const service = getPlatformService(platform);
  const redirectUri = new URL(
    `/api/platforms/${platform}/callback`,
    origin
  ).toString();

  const state = encodeState({ userId: user.id, platform });
  const result = service.getAuthorizeUrl({ state, redirectUri });

  if (result.status !== "ok") {
    const reason =
      result.status === "unsupported" ? result.reason : result.error;
    return NextResponse.redirect(
      accountsUrl(`error=${encodeURIComponent(reason)}`)
    );
  }

  return NextResponse.redirect(result.data);
}
