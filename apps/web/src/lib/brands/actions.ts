"use server";

import { revalidatePath } from "next/cache";

import { prisma, type Platform } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { ensureAppUser } from "@/lib/users/ensure-app-user";
import { brandFormSchema } from "@/lib/brands/schemas";

export type BrandActionResult =
  | { ok: true; brandId: string; isFirst: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function toBrandData(values: ReturnType<typeof brandFormSchema.parse>) {
  return {
    name: values.name,
    industry: values.industry ?? null,
    audience: values.audience ?? null,
    tone: values.tone ?? null,
    websiteUrl: values.websiteUrl ?? null,
    offer: values.offer ?? null,
    contentGoals: values.contentGoals,
    preferredPlatforms: values.preferredPlatforms as Platform[],
    postingFrequency: values.postingFrequency ?? null,
    forbiddenTopics: values.forbiddenTopics,
    preferredCta: values.preferredCta ?? null,
    brandColors: values.brandColors,
    logoUrl: values.logoUrl ?? null,
    videoStylePreference: values.videoStylePreference ?? null,
  };
}

export async function createBrand(input: unknown): Promise<BrandActionResult> {
  const user = await getDashboardUser();
  await ensureAppUser(user);

  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingCount = await prisma.brand.count({
    where: { userId: user.id },
  });
  const isFirst = existingCount === 0;

  const brand = await prisma.brand.create({
    data: {
      ...toBrandData(parsed.data),
      userId: user.id,
      isDefault: isFirst,
    },
  });

  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard");

  return { ok: true, brandId: brand.id, isFirst };
}

export async function updateBrand(
  brandId: string,
  input: unknown
): Promise<BrandActionResult> {
  const user = await getDashboardUser();

  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.brand.findFirst({
    where: { id: brandId, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Brand not found." };
  }

  await prisma.brand.update({
    where: { id: brandId },
    data: toBrandData(parsed.data),
  });

  revalidatePath("/dashboard/brands");
  revalidatePath(`/dashboard/brands/${brandId}`);

  return { ok: true, brandId, isFirst: false };
}

export async function deleteBrand(brandId: string): Promise<BrandActionResult> {
  const user = await getDashboardUser();

  const existing = await prisma.brand.findFirst({
    where: { id: brandId, userId: user.id },
    select: { id: true, isDefault: true },
  });
  if (!existing) {
    return { ok: false, error: "Brand not found." };
  }

  await prisma.brand.delete({ where: { id: brandId } });

  // Promote another brand to default if we just removed the default one.
  if (existing.isDefault) {
    const next = await prisma.brand.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (next) {
      await prisma.brand.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard");

  return { ok: true, brandId, isFirst: false };
}
