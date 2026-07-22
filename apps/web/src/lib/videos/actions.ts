"use server";

import { revalidatePath } from "next/cache";

import {
  hasLlmProvider,
  topicAgent,
  youtubeScriptAgent,
  type BrandContext,
} from "@postpylot/ai";
import { prisma, type Prisma } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { ensureAppUser } from "@/lib/users/ensure-app-user";
import {
  enqueuePublishVideo,
  enqueueRenderVideo,
} from "@/lib/jobs/queue";
import {
  generateVideoSchema,
  scheduleVideoSchema,
  videoIdSchema,
} from "@/lib/videos/schemas";

export type VideoActionResult =
  | { ok: true; videoId: string }
  | { ok: false; error: string };

export type SimpleVideoResult = { ok: true } | { ok: false; error: string };

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

// Generates a YouTube script with Gemini, creates a Video project, and enqueues
// the render job in the worker (Remotion + Piper). Returns the new video id.
export async function generateVideoAction(
  input: unknown
): Promise<VideoActionResult> {
  const user = await getDashboardUser();
  await ensureAppUser(user);

  if (!hasLlmProvider()) {
    return {
      ok: false,
      error:
        "No AI provider configured. Add GEMINI_API_KEY (or OPENAI_API_KEY) to your environment.",
    };
  }

  const parsed = generateVideoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Pick a brand to generate a video." };
  }

  const brand = await prisma.brand.findFirst({
    where: { id: parsed.data.brandId, userId: user.id },
  });
  if (!brand) {
    return { ok: false, error: "Brand not found." };
  }

  try {
    const brandContext = toBrandContext(brand);
    const topic = await topicAgent(brandContext, parsed.data.topicHint);
    const script = await youtubeScriptAgent(brandContext, topic);

    const narration = script.scenes.map((s) => s.narration).join("\n\n");
    const metadata: Prisma.InputJsonValue = {
      tags: script.tags,
      scenes: script.scenes,
      topicTitle: topic.title,
    };

    const video = await prisma.video.create({
      data: {
        brandId: brand.id,
        platform: "youtube",
        aspectRatio: "horizontal_16_9",
        status: "draft",
        title: script.title,
        description: script.description,
        script: narration,
        metadata,
      },
    });

    await enqueueRenderVideo(video.id);

    revalidatePath("/dashboard/videos");
    revalidatePath("/dashboard");
    return { ok: true, videoId: video.id };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Video generation failed. Try again.",
    };
  }
}

async function ownedVideo(userId: string, videoId: string) {
  return prisma.video.findFirst({
    where: { id: videoId, brand: { userId } },
    select: { id: true, brandId: true, status: true },
  });
}

// Re-enqueues the render job (used to retry a failed render or re-render).
export async function renderVideoAction(
  input: unknown
): Promise<SimpleVideoResult> {
  const user = await getDashboardUser();
  const parsed = videoIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid video." };

  const video = await ownedVideo(user.id, parsed.data.videoId);
  if (!video) return { ok: false, error: "Video not found." };

  try {
    await prisma.video.update({
      where: { id: video.id },
      data: { status: "draft" },
    });
    await enqueueRenderVideo(video.id);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? `Could not render: ${error.message}` : "Could not render.",
    };
  }

  revalidatePath("/dashboard/videos");
  return { ok: true };
}

async function createScheduleAndEnqueue(
  brandId: string,
  videoId: string,
  scheduledAt: Date
): Promise<void> {
  const schedule = await prisma.schedule.create({
    data: { brandId, videoId, scheduledAt, status: "scheduled" },
  });
  await prisma.video.update({
    where: { id: videoId },
    data: { status: "scheduled" },
  });
  await enqueuePublishVideo(schedule.id, scheduledAt);
}

export async function scheduleVideoAction(
  input: unknown
): Promise<SimpleVideoResult> {
  const user = await getDashboardUser();
  const parsed = scheduleVideoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pick a valid date and time." };

  const video = await ownedVideo(user.id, parsed.data.videoId);
  if (!video) return { ok: false, error: "Video not found." };
  if (video.status === "draft") {
    return { ok: false, error: "Video is still rendering. Wait for it to finish." };
  }
  if (video.status === "published" || video.status === "publishing") {
    return { ok: false, error: "This video is already being published." };
  }

  try {
    await createScheduleAndEnqueue(
      video.brandId,
      video.id,
      parsed.data.scheduledAt
    );
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? `Could not schedule: ${error.message}` : "Could not schedule.",
    };
  }

  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function publishVideoNowAction(
  input: unknown
): Promise<SimpleVideoResult> {
  const user = await getDashboardUser();
  const parsed = videoIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid video." };

  const video = await ownedVideo(user.id, parsed.data.videoId);
  if (!video) return { ok: false, error: "Video not found." };
  if (video.status === "draft") {
    return { ok: false, error: "Video is still rendering. Wait for it to finish." };
  }
  if (video.status === "published" || video.status === "publishing") {
    return { ok: false, error: "This video is already being published." };
  }

  try {
    await createScheduleAndEnqueue(video.brandId, video.id, new Date());
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? `Could not publish: ${error.message}` : "Could not publish.",
    };
  }

  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteVideoAction(
  input: unknown
): Promise<SimpleVideoResult> {
  const user = await getDashboardUser();
  const parsed = videoIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid video." };

  const video = await ownedVideo(user.id, parsed.data.videoId);
  if (!video) return { ok: false, error: "Video not found." };

  await prisma.video.delete({ where: { id: video.id } });

  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard");
  return { ok: true };
}
