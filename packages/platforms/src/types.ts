import type { Platform, ServiceResult } from "@postpylot/shared";

export type PlatformTokens = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes: string[];
};

export type PlatformAccountInfo = {
  externalId: string;
  accountName: string;
  metadata?: Record<string, unknown>;
};

export type ConnectResult = {
  tokens: PlatformTokens;
  account: PlatformAccountInfo;
};

export type PublishPostInput = {
  accessToken: string;
  content: string;
  hashtags: string[];
  imageUrl?: string | null;
  // Platform-specific target, e.g. the Facebook Page id or LinkedIn author URN.
  externalId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type PublishResult = {
  platformPostId: string;
  url?: string;
};

// Input for uploading a rendered video to a video-first platform (YouTube).
// `videoSource` is a local file path in the worker or an http(s) URL; the
// service resolves it into an upload stream.
export type PublishVideoInput = {
  accessToken: string;
  title: string;
  description: string;
  tags: string[];
  videoSource: string;
  thumbnailSource?: string | null;
  privacyStatus?: "private" | "unlisted" | "public";
  // Platform-specific target, e.g. the YouTube channel id.
  externalId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AnalyticsInput = {
  accessToken: string;
  platformPostId: string;
  externalId?: string | null;
};

export type AnalyticsMetric = {
  metric: string;
  value: number;
};

// The uniform contract every platform implements. Actions that a platform does
// not support in the MVP return a typed `unsupported` result instead of throwing
// (per postpylot-architecture.mdc).
export interface PlatformService {
  readonly platform: Platform;
  /** Whether the OAuth app credentials are configured in the environment. */
  isConfigured(): boolean;
  getAuthorizeUrl(params: {
    state: string;
    redirectUri: string;
  }): ServiceResult<string>;
  exchangeCode(params: {
    code: string;
    redirectUri: string;
  }): Promise<ServiceResult<ConnectResult>>;
  refreshAccessToken(
    refreshToken: string
  ): Promise<ServiceResult<PlatformTokens>>;
  publishPost(input: PublishPostInput): Promise<ServiceResult<PublishResult>>;
  publishVideo(input: PublishVideoInput): Promise<ServiceResult<PublishResult>>;
  getAnalytics(
    input: AnalyticsInput
  ): Promise<ServiceResult<AnalyticsMetric[]>>;
}
