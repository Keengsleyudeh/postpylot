import "server-only";

import { prisma } from "@postpylot/db";

// Videos for a user's brands, with the latest schedule and thumbnail. Never
// selects platform-account tokens; those stay server-side in the worker path.
export function getVideosForUser(userId: string) {
  return prisma.video.findMany({
    where: { brand: { userId } },
    orderBy: { updatedAt: "desc" },
    include: {
      brand: { select: { name: true } },
      thumbnailAsset: { select: { url: true } },
      schedules: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { scheduledAt: true, status: true },
      },
    },
  });
}
