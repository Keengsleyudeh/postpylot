import type { Platform } from "@postpylot/shared";

import { facebookService } from "./facebook";
import { linkedinService } from "./linkedin";
import type { PlatformService } from "./types";
import { tiktokService, youtubeService } from "./video-platforms";

const SERVICES: Record<Platform, PlatformService> = {
  linkedin: linkedinService,
  facebook: facebookService,
  youtube: youtubeService,
  tiktok: tiktokService,
};

export function getPlatformService(platform: Platform): PlatformService {
  return SERVICES[platform];
}

export function listPlatformServices(): PlatformService[] {
  return Object.values(SERVICES);
}
