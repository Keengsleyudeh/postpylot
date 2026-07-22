import { fail, ok, unsupported, type ServiceResult } from "@postpylot/shared";

import type {
  AnalyticsMetric,
  ConnectResult,
  PlatformService,
  PlatformTokens,
  PublishPostInput,
  PublishResult,
} from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";
const AUTHORIZE_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const SCOPES = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"];

function credentials() {
  return {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  };
}

function buildMessage(input: PublishPostInput): string {
  const tags = input.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`));
  return tags.length ? `${input.content}\n\n${tags.join(" ")}` : input.content;
}

export const facebookService: PlatformService = {
  platform: "facebook",

  isConfigured() {
    const { clientId, clientSecret } = credentials();
    return Boolean(clientId && clientSecret);
  },

  getAuthorizeUrl({ state, redirectUri }): ServiceResult<string> {
    const { clientId } = credentials();
    if (!clientId) {
      return unsupported("Facebook OAuth is not configured.");
    }
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", SCOPES.join(","));
    url.searchParams.set("response_type", "code");
    return ok(url.toString());
  },

  async exchangeCode({ code, redirectUri }): Promise<ServiceResult<ConnectResult>> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("Facebook OAuth is not configured.");
    }

    try {
      // 1. Short-lived user token.
      const shortRes = await fetch(
        `${GRAPH}/oauth/access_token?` +
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          })
      );
      if (!shortRes.ok) {
        return fail(`Facebook token exchange failed (${shortRes.status}).`);
      }
      const shortToken = (await shortRes.json()) as { access_token: string };

      // 2. Long-lived user token (~60 days).
      const longRes = await fetch(
        `${GRAPH}/oauth/access_token?` +
          new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: clientId,
            client_secret: clientSecret,
            fb_exchange_token: shortToken.access_token,
          })
      );
      const longToken = longRes.ok
        ? ((await longRes.json()) as { access_token: string; expires_in?: number })
        : { access_token: shortToken.access_token, expires_in: undefined };

      // 3. Pages the user manages. Page tokens derived from a long-lived user
      //    token do not expire, so we store the Page token as the access token.
      const pagesRes = await fetch(
        `${GRAPH}/me/accounts?` +
          new URLSearchParams({ access_token: longToken.access_token })
      );
      if (!pagesRes.ok) {
        return fail(`Facebook pages fetch failed (${pagesRes.status}).`);
      }
      const pages = (await pagesRes.json()) as {
        data: Array<{ id: string; name: string; access_token: string }>;
      };

      const page = pages.data[0];
      if (!page) {
        return fail("No Facebook Page found for this account.");
      }

      const tokens: PlatformTokens = {
        accessToken: page.access_token,
        refreshToken: null,
        expiresAt: null,
        scopes: SCOPES,
      };

      return ok({
        tokens,
        account: {
          externalId: page.id,
          accountName: page.name,
          // Store only non-secret metadata (names). Never store extra tokens here.
          metadata: { pageNames: pages.data.map((p) => p.name) },
        },
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "Facebook connect failed.",
        true
      );
    }
  },

  async refreshAccessToken(): Promise<ServiceResult<PlatformTokens>> {
    return unsupported("Facebook Page tokens do not require refresh in the MVP.");
  },

  async publishPost(input: PublishPostInput): Promise<ServiceResult<PublishResult>> {
    if (!input.externalId) {
      return fail("Missing Facebook Page id.");
    }
    try {
      const message = buildMessage(input);
      const endpoint = input.imageUrl
        ? `${GRAPH}/${input.externalId}/photos`
        : `${GRAPH}/${input.externalId}/feed`;

      const body = new URLSearchParams({ access_token: input.accessToken });
      if (input.imageUrl) {
        body.set("url", input.imageUrl);
        body.set("caption", message);
      } else {
        body.set("message", message);
      }

      const res = await fetch(endpoint, { method: "POST", body });
      if (!res.ok) {
        const text = await res.text();
        return fail(`Facebook publish failed (${res.status}): ${text}`, true);
      }

      const data = (await res.json()) as { id?: string; post_id?: string };
      const postId = data.post_id ?? data.id ?? "unknown";
      return ok({
        platformPostId: postId,
        url: `https://www.facebook.com/${postId}`,
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "Facebook publish failed.",
        true
      );
    }
  },

  async publishVideo(): Promise<ServiceResult<PublishResult>> {
    return unsupported("Facebook video publishing arrives with the video phase.");
  },

  async getAnalytics(): Promise<ServiceResult<AnalyticsMetric[]>> {
    return unsupported("Facebook analytics is not available in the MVP.");
  },
};
