import "server-only";

import { prisma } from "@postpylot/db";

export function getBrandsForUser(userId: string) {
  return prisma.brand.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export function getBrandById(userId: string, brandId: string) {
  return prisma.brand.findFirst({
    where: { id: brandId, userId },
  });
}

export function getBrandCount(userId: string) {
  return prisma.brand.count({ where: { userId } });
}
