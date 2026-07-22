import "server-only";

import { prisma } from "@postpylot/db";

export function getAutomationRules(userId: string) {
  return prisma.automationRule.findMany({
    where: { brand: { userId } },
    orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true } } },
  });
}
