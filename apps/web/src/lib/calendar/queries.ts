import "server-only";

import { prisma } from "@postpylot/db";

export function getUpcomingSchedules(userId: string) {
  return prisma.schedule.findMany({
    where: {
      brand: { userId },
      status: { in: ["scheduled", "publishing"] },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
    include: {
      brand: { select: { name: true } },
      post: { select: { platform: true, content: true } },
    },
  });
}
