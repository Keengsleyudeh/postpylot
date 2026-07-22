"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { enqueuePublishPost } from "@/lib/jobs/queue";

export type PostActionResult =
  | { ok: true }
  | { ok: false; error: string };

const scheduleSchema = z.object({
  postId: z.string().min(1),
  scheduledAt: z.coerce.date(),
});

async function ownedPost(userId: string, postId: string) {
  return prisma.post.findFirst({
    where: { id: postId, brand: { userId } },
    select: { id: true, brandId: true, status: true },
  });
}

// Creates a schedule and enqueues a pg-boss publish job. Used for both future
// scheduling and immediate publishing (scheduledAt = now).
async function createScheduleAndEnqueue(
  brandId: string,
  postId: string,
  scheduledAt: Date
): Promise<void> {
  const schedule = await prisma.schedule.create({
    data: { brandId, postId, scheduledAt, status: "scheduled" },
  });
  await prisma.post.update({
    where: { id: postId },
    data: { status: "scheduled" },
  });
  await enqueuePublishPost(schedule.id, scheduledAt);
}

export async function schedulePostAction(
  input: unknown
): Promise<PostActionResult> {
  const user = await getDashboardUser();

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Pick a valid date and time." };
  }

  const post = await ownedPost(user.id, parsed.data.postId);
  if (!post) return { ok: false, error: "Post not found." };
  if (post.status === "published" || post.status === "publishing") {
    return { ok: false, error: "This post is already being published." };
  }

  try {
    await createScheduleAndEnqueue(
      post.brandId,
      post.id,
      parsed.data.scheduledAt
    );
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not schedule: ${error.message}`
          : "Could not schedule.",
    };
  }

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function publishPostNowAction(
  input: unknown
): Promise<PostActionResult> {
  const user = await getDashboardUser();

  const postId =
    input && typeof input === "object" && "postId" in input
      ? String((input as Record<string, unknown>).postId)
      : "";
  const post = await ownedPost(user.id, postId);
  if (!post) return { ok: false, error: "Post not found." };
  if (post.status === "published" || post.status === "publishing") {
    return { ok: false, error: "This post is already being published." };
  }

  try {
    await createScheduleAndEnqueue(post.brandId, post.id, new Date());
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not publish: ${error.message}`
          : "Could not publish.",
    };
  }

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deletePostAction(
  input: unknown
): Promise<PostActionResult> {
  const user = await getDashboardUser();

  const postId =
    input && typeof input === "object" && "postId" in input
      ? String((input as Record<string, unknown>).postId)
      : "";
  const post = await ownedPost(user.id, postId);
  if (!post) return { ok: false, error: "Post not found." };

  await prisma.post.delete({ where: { id: post.id } });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");
  return { ok: true };
}
