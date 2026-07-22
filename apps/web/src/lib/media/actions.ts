"use server";

import { revalidatePath } from "next/cache";

import { prisma, type Platform } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { renderQuoteCard } from "@/lib/media/render";
import { createAdminClient, getMediaBucket } from "@/lib/supabase/admin";

export type GenerateImageResult =
  | { ok: true; url: string; mediaAssetId: string }
  | { ok: false; error: string };

function readTopicTitle(metadata: unknown): string | null {
  if (metadata && typeof metadata === "object" && "topicTitle" in metadata) {
    const value = (metadata as Record<string, unknown>).topicTitle;
    return typeof value === "string" ? value : null;
  }
  return null;
}

export async function generateImageAction(
  input: unknown
): Promise<GenerateImageResult> {
  const user = await getDashboardUser();

  const postId =
    input && typeof input === "object" && "postId" in input
      ? String((input as Record<string, unknown>).postId)
      : "";
  if (!postId) {
    return { ok: false, error: "Missing post." };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, brand: { userId: user.id } },
    include: { brand: true },
  });
  if (!post) {
    return { ok: false, error: "Post not found." };
  }

  const brandColors = Array.isArray(post.brand.brandColors)
    ? (post.brand.brandColors as unknown[]).filter(
        (c): c is string => typeof c === "string"
      )
    : [];

  let rendered: Awaited<ReturnType<typeof renderQuoteCard>>;
  try {
    rendered = await renderQuoteCard({
      title: readTopicTitle(post.metadata) ?? post.brand.name,
      body: post.content,
      brandName: post.brand.name,
      platform: post.platform as Platform,
      colors: brandColors,
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Image rendering failed.",
    };
  }

  try {
    const admin = createAdminClient();
    const bucket = getMediaBucket();

    // Ensure the bucket exists (idempotent) so this works out of the box.
    await admin.storage.createBucket(bucket, { public: true }).catch(() => {});

    const path = `${post.brandId}/${post.id}-${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(path, rendered.buffer, {
        contentType: "image/png",
        upsert: true,
      });
    if (uploadError) {
      return { ok: false, error: `Storage upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(bucket).getPublicUrl(path);

    const asset = await prisma.mediaAsset.create({
      data: {
        brandId: post.brandId,
        type: "post_image",
        storagePath: path,
        url: publicUrl,
        mimeType: "image/png",
        width: rendered.width,
        height: rendered.height,
      },
    });

    await prisma.post.update({
      where: { id: post.id },
      data: { mediaAssetId: asset.id },
    });

    revalidatePath("/dashboard/posts");

    return { ok: true, url: publicUrl, mediaAssetId: asset.id };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Storage upload failed.",
    };
  }
}
