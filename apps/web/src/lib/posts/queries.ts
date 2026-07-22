import "server-only";

import { prisma } from "@postpylot/db";

export function getPostsForUser(userId: string) {
  return prisma.post.findMany({
    where: { brand: { userId } },
    orderBy: { updatedAt: "desc" },
    include: {
      brand: { select: { name: true } },
      mediaAsset: { select: { url: true } },
      schedules: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { scheduledAt: true, status: true },
      },
    },
  });
}
