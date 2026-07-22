import "server-only";

import { prisma } from "@postpylot/db";

// Never selects token columns — encrypted tokens stay server-side and are only
// read inside the worker/publish path.
export function getPlatformAccounts(userId: string) {
  return prisma.platformAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      platform: true,
      status: true,
      accountName: true,
      createdAt: true,
    },
  });
}
