import { fail, ok, unsupported, type ServiceResult } from "@postpylot/shared";

import type {
  AnalyticsMetric,
  ConnectResult,
  PlatformService,
  PlatformTokens,
  PublishPostInput,
  PublishResult,
} from "./types";

const AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";
const SCOPES = ["openid", "profile", "w_member_social"];

function credentials() {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  };
}

function buildContent(input: PublishPostInput): string {
  const tags = input.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`));
  return tags.length ? `${input.content}\n\n${tags.join(" ")}` : input.content;
}

export const linkedinService: PlatformService = {
  platform: "linkedin",

  isConfigured() {
    const { clientId, clientSecret } = credentials();
    return Boolean(clientId && clientSecret);
  },

  getAuthorizeUrl({ state, redirectUri }): ServiceResult<string> {
    const { clientId } = credentials();
    if (!clientId) {
      return unsupported("LinkedIn OAuth is not configured.");
    }
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", SCOPES.join(" "));
    url.searchParams.set("state", state);
    return ok(url.toString());
  },

  async exchangeCode({ code, redirectUri }): Promise<ServiceResult<ConnectResult>> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("LinkedIn OAuth is not configured.");
    }

    try {
      const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenRes.ok) {
        return fail(`LinkedIn token exchange failed (${tokenRes.status}).`);
      }

      const token = (await tokenRes.json()) as {
        access_token: string;
        expires_in?: number;
        refresh_token?: string;
        scope?: string;
      };

      const profileRes = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!profileRes.ok) {
        return fail(`LinkedIn profile fetch failed (${profileRes.status}).`);
      }
      const profile = (await profileRes.json()) as {
        sub: string;
        name?: string;
      };

      const tokens: PlatformTokens = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? null,
        expiresAt: token.expires_in
          ? new Date(Date.now() + token.expires_in * 1000)
          : null,
        scopes: token.scope ? token.scope.split(" ") : SCOPES,
      };

      return ok({
        tokens,
        account: {
          externalId: profile.sub,
          accountName: profile.name ?? "LinkedIn member",
        },
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "LinkedIn connect failed.",
        true
      );
    }
  },

  async refreshAccessToken(): Promise<ServiceResult<PlatformTokens>> {
    // LinkedIn only issues refresh tokens to approved partners; reconnect flow
    // is used instead for the MVP.
    return unsupported("LinkedIn does not support token refresh in the MVP.");
  },

  async publishPost(input: PublishPostInput): Promise<ServiceResult<PublishResult>> {
    if (!input.externalId) {
      return fail("Missing LinkedIn author id.");
    }
    try {
      const res = await fetch(UGC_POSTS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${input.externalId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: buildContent(input) },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return fail(`LinkedIn publish failed (${res.status}): ${body}`, true);
      }

      const postId =
        res.headers.get("x-restli-id") ??
        ((await res.json()) as { id?: string }).id ??
        "unknown";

      return ok({
        platformPostId: postId,
        url: `https://www.linkedin.com/feed/update/${postId}`,
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "LinkedIn publish failed.",
        true
      );
    }
  },

  async publishVideo(): Promise<ServiceResult<PublishResult>> {
    return unsupported("LinkedIn video publishing arrives with the video phase.");
  },

  async getAnalytics(): Promise<ServiceResult<AnalyticsMetric[]>> {
    return unsupported("LinkedIn analytics is not available in the MVP.");
  },
};
