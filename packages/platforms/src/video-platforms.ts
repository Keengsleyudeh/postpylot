import { unsupported, type Platform, type ServiceResult } from "@postpylot/shared";

import type {
  AnalyticsMetric,
  ConnectResult,
  PlatformService,
  PlatformTokens,
  PublishResult,
} from "./types";

// TikTok is a video-first platform whose OAuth + Content Posting API flow is
// implemented alongside the video pipeline in a later phase. Until then every
// action returns a typed `unsupported` result so the app never fakes a
// connection or a publish. (YouTube is now implemented in ./youtube.)
function createVideoFirstService(
  platform: Platform,
  label: string
): PlatformService {
  const reason = `${label} connects with the video pipeline (Phase 8).`;
  return {
    platform,
    isConfigured: () => false,
    getAuthorizeUrl: (): ServiceResult<string> => unsupported(reason),
    exchangeCode: async (): Promise<ServiceResult<ConnectResult>> =>
      unsupported(reason),
    refreshAccessToken: async (): Promise<ServiceResult<PlatformTokens>> =>
      unsupported(reason),
    publishPost: async (): Promise<ServiceResult<PublishResult>> =>
      unsupported(reason),
    publishVideo: async (): Promise<ServiceResult<PublishResult>> =>
      unsupported(reason),
    getAnalytics: async (): Promise<ServiceResult<AnalyticsMetric[]>> =>
      unsupported(reason),
  };
}

export const tiktokService = createVideoFirstService("tiktok", "TikTok");
