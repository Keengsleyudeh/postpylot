import { prisma } from "@postpylot/db";
import { decryptToken, getPlatformService } from "@postpylot/platforms";
import { platformLabel } from "@postpylot/shared";

// Publishes a scheduled post to its platform. Never fakes success: unsupported
// platforms and errors are recorded as failures with a clear reason.
export async function handlePublishPost(scheduleId: string): Promise<void> {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { post: { include: { brand: true, mediaAsset: true } } },
  });

  if (!schedule || !schedule.post) {
    console.warn(`[publish-post] schedule ${scheduleId} has no post; skipping.`);
    return;
  }

  const post = schedule.post;

  async function markFailed(reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.post.update({
        where: { id: post.id },
        data: { status: "failed" },
      }),
      prisma.schedule.update({
        where: { id: schedule!.id },
        data: { status: "failed" },
      }),
      prisma.notification.create({
        data: {
          userId: post.brand.userId,
          type: "publish_failed",
          title: `${platformLabel(post.platform)} publish failed`,
          body: reason,
        },
      }),
    ]);
    console.error(`[publish-post] ${post.id} failed: ${reason}`);
  }

  const account = await prisma.platformAccount.findFirst({
    where: {
      userId: post.brand.userId,
      platform: post.platform,
      status: "connected",
    },
  });

  if (!account?.accessToken) {
    await markFailed(
      `No connected ${platformLabel(post.platform)} account. Connect it in Accounts.`
    );
    return;
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { status: "publishing" },
  });

  let accessToken: string;
  try {
    accessToken = decryptToken(account.accessToken);
  } catch {
    await markFailed("Stored access token could not be decrypted.");
    return;
  }

  const service = getPlatformService(post.platform);
  const result = await service.publishPost({
    accessToken,
    content: post.content,
    hashtags: post.hashtags,
    imageUrl: post.mediaAsset?.url ?? null,
    externalId: account.externalId,
  });

  if (result.status === "ok") {
    await prisma.$transaction([
      prisma.post.update({
        where: { id: post.id },
        data: {
          status: "published",
          platformPostId: result.data.platformPostId,
          publishedAt: new Date(),
          metadata: result.data.url ? { url: result.data.url } : undefined,
        },
      }),
      prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: "published" },
      }),
      prisma.notification.create({
        data: {
          userId: post.brand.userId,
          type: "published",
          title: `Published to ${platformLabel(post.platform)}`,
          body: result.data.url ?? null,
        },
      }),
    ]);
    console.log(`[publish-post] ${post.id} published to ${post.platform}.`);
    return;
  }

  const reason =
    result.status === "unsupported" ? result.reason : result.error;
  await markFailed(reason);
}
