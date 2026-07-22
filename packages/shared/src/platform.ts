// Platform identifiers. Kept as a string-literal union (not importing Prisma) so
// this package stays dependency-free and usable from the worker and web alike.
// Values MUST match the `Platform` enum in packages/db/prisma/schema.prisma.
export const PLATFORMS = ["youtube", "tiktok", "linkedin", "facebook"] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

// Platforms that can publish plain text/image posts in the MVP. YouTube and
// TikTok are video-first and handled by the video pipeline in a later phase.
export const TEXT_POST_PLATFORMS: readonly Platform[] = ["linkedin", "facebook"];

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function platformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform];
}
