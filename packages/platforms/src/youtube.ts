import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

import { google } from "googleapis";

import { fail, ok, unsupported, type ServiceResult } from "@postpylot/shared";

import type {
  AnalyticsMetric,
  ConnectResult,
  PlatformService,
  PlatformTokens,
  PublishPostInput,
  PublishResult,
  PublishVideoInput,
} from "./types";

// YouTube publishing via the official YouTube Data API v3 (`googleapis`), per
// postpylot-integrations.mdc. OAuth is separate from app SSO: we request the
// upload + read scopes, store encrypted tokens, and upload rendered videos from
// the worker. This is publishing OAuth, not login.

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];

function credentials() {
  return {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  };
}

// A fresh OAuth2 client. `redirectUri` is required for the authorize/exchange
// steps; token refresh and uploads do not need it.
function oauthClient(redirectUri?: string) {
  const { clientId, clientSecret } = credentials();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Resolve a video/thumbnail source (local worker path or http(s) URL) into a
// stream the googleapis client can upload.
async function toUploadStream(source: string): Promise<Readable> {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to fetch media source (${res.status}).`);
    }
    return Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]);
  }
  return createReadStream(source);
}

export const youtubeService: PlatformService = {
  platform: "youtube",

  isConfigured() {
    const { clientId, clientSecret } = credentials();
    return Boolean(clientId && clientSecret);
  },

  getAuthorizeUrl({ state, redirectUri }): ServiceResult<string> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("YouTube OAuth is not configured.");
    }
    const url = oauthClient(redirectUri).generateAuthUrl({
      access_type: "offline",
      // Force a refresh token even on re-consent so the worker can refresh.
      prompt: "consent",
      include_granted_scopes: true,
      scope: SCOPES,
      state,
    });
    return ok(url);
  },

  async exchangeCode({ code, redirectUri }): Promise<ServiceResult<ConnectResult>> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("YouTube OAuth is not configured.");
    }

    try {
      const client = oauthClient(redirectUri);
      const { tokens } = await client.getToken(code);
      if (!tokens.access_token) {
        return fail("YouTube token exchange returned no access token.");
      }
      client.setCredentials(tokens);

      // Identify the channel this token can publish to.
      const youtube = google.youtube({ version: "v3", auth: client });
      const channelRes = await youtube.channels.list({
        part: ["snippet"],
        mine: true,
      });
      const channel = channelRes.data.items?.[0];
      if (!channel?.id) {
        return fail("No YouTube channel found for this account.");
      }

      const platformTokens: PlatformTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope ? tokens.scope.split(" ") : SCOPES,
      };

      return ok({
        tokens: platformTokens,
        account: {
          externalId: channel.id,
          accountName: channel.snippet?.title ?? "YouTube channel",
          metadata: {
            customUrl: channel.snippet?.customUrl ?? null,
          },
        },
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "YouTube connect failed.",
        true
      );
    }
  },

  async refreshAccessToken(
    refreshToken: string
  ): Promise<ServiceResult<PlatformTokens>> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("YouTube OAuth is not configured.");
    }
    try {
      const client = oauthClient();
      client.setCredentials({ refresh_token: refreshToken });
      const { credentials: refreshed } = await client.refreshAccessToken();
      if (!refreshed.access_token) {
        return fail("YouTube token refresh returned no access token.");
      }
      return ok({
        accessToken: refreshed.access_token,
        // Google may not re-send the refresh token; keep the existing one.
        refreshToken: refreshed.refresh_token ?? refreshToken,
        expiresAt: refreshed.expiry_date
          ? new Date(refreshed.expiry_date)
          : null,
        scopes: refreshed.scope ? refreshed.scope.split(" ") : SCOPES,
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "YouTube token refresh failed.",
        true
      );
    }
  },

  async publishPost(
    _input: PublishPostInput
  ): Promise<ServiceResult<PublishResult>> {
    return unsupported("YouTube publishes videos, not text posts.");
  },

  async publishVideo(
    input: PublishVideoInput
  ): Promise<ServiceResult<PublishResult>> {
    const { clientId, clientSecret } = credentials();
    if (!clientId || !clientSecret) {
      return unsupported("YouTube OAuth is not configured.");
    }

    try {
      const client = oauthClient();
      client.setCredentials({ access_token: input.accessToken });
      const youtube = google.youtube({ version: "v3", auth: client });

      const media = await toUploadStream(input.videoSource);
      const insertRes = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: input.title.slice(0, 100),
            description: input.description,
            tags: input.tags.length ? input.tags : undefined,
          },
          status: {
            privacyStatus: input.privacyStatus ?? "private",
            selfDeclaredMadeForKids: false,
          },
        },
        media: { body: media },
      });

      const videoId = insertRes.data.id;
      if (!videoId) {
        return fail("YouTube upload returned no video id.", true);
      }

      // Best-effort custom thumbnail; do not fail the publish if it is rejected
      // (e.g. thumbnails require a verified channel).
      if (input.thumbnailSource) {
        try {
          const thumb = await toUploadStream(input.thumbnailSource);
          await youtube.thumbnails.set({
            videoId,
            media: { body: thumb },
          });
        } catch {
          // Ignore thumbnail errors; the video is already published.
        }
      }

      return ok({
        platformPostId: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : "YouTube publish failed.",
        true
      );
    }
  },

  async getAnalytics(): Promise<ServiceResult<AnalyticsMetric[]>> {
    return unsupported("YouTube analytics is not available in the MVP.");
  },
};
