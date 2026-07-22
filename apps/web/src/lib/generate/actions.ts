"use server";

import { revalidatePath } from "next/cache";

import { generateDrafts, hasLlmProvider, type BrandContext } from "@postpylot/ai";
import { prisma, type Platform, type Prisma } from "@postpylot/db";
import type { GeneratedDraft, TopicSuggestion } from "@postpylot/shared";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { ensureAppUser } from "@/lib/users/ensure-app-user";
import {
  generateInputSchema,
  saveDraftSchema,
} from "@/lib/generate/schemas";

export type GenerateDraftsResult =
  | { ok: true; topic: TopicSuggestion; drafts: GeneratedDraft[] }
  | { ok: false; error: string };

export type SaveDraftResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

function toBrandContext(brand: {
  id: string;
  name: string;
  industry: string | null;
  audience: string | null;
  tone: string | null;
  offer: string | null;
  contentGoals: string[];
  forbiddenTopics: string[];
  preferredCta: string | null;
}): BrandContext {
  return {
    id: brand.id,
    name: brand.name,
    industry: brand.industry,
    audience: brand.audience,
    tone: brand.tone,
    offer: brand.offer,
    contentGoals: brand.contentGoals,
    forbiddenTopics: brand.forbiddenTopics,
    preferredCta: brand.preferredCta,
  };
}

export async function generateDraftsAction(
  input: unknown
): Promise<GenerateDraftsResult> {
  const user = await getDashboardUser();
  await ensureAppUser(user);

  if (!hasLlmProvider()) {
    return {
      ok: false,
      error:
        "No AI provider configured. Add GEMINI_API_KEY (or OPENAI_API_KEY) to your environment.",
    };
  }

  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request. Pick a brand and platforms." };
  }

  const brand = await prisma.brand.findFirst({
    where: { id: parsed.data.brandId, userId: user.id },
  });
  if (!brand) {
    return { ok: false, error: "Brand not found." };
  }

  try {
    const { topic, drafts } = await generateDrafts({
      brand: toBrandContext(brand),
      platforms: parsed.data.platforms as Platform[],
      topicHint: parsed.data.topicHint,
    });
    return { ok: true, topic, drafts };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Generation failed. Try again.",
    };
  }
}

export async function saveDraftAction(
  input: unknown
): Promise<SaveDraftResult> {
  const user = await getDashboardUser();

  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid draft." };
  }

  const brand = await prisma.brand.findFirst({
    where: { id: parsed.data.brandId, userId: user.id },
    select: { id: true },
  });
  if (!brand) {
    return { ok: false, error: "Brand not found." };
  }

  const metadata: Prisma.InputJsonValue = {
    imageIdea: parsed.data.imageIdea ?? null,
    topicTitle: parsed.data.topicTitle ?? null,
  };

  const post = await prisma.post.create({
    data: {
      brandId: brand.id,
      platform: parsed.data.platform as Platform,
      status: "generated",
      content: parsed.data.content,
      hashtags: parsed.data.hashtags,
      metadata,
    },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true, postId: post.id };
}
