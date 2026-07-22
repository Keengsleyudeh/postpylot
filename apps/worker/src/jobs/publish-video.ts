import { prisma } from "@postpylot/db";
import {
  decryptToken,
  encryptToken,
  encryptNullable,
  getPlatformService,
} from "@postpylot/platforms";
import { platformLabel } from "@postpylot/shared";

// Publishes a rendered Video to its platform (YouTube in the MVP). Never fakes
// success: unsupported platforms and errors are recorded as failures with a
// clear reason and an in-app notification.
export async function handlePublishVideo(scheduleId: string): Promise<void> {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { video: { include: { brand: true, thumbnailAsset: true } } },
  });

  if (!schedule || !schedule.video) {
    console.warn(`[publish-video] schedule ${scheduleId} has no video; skipping.`);
    return;
  }

  const video = schedule.video;

  async function markFailed(reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.video.update({
        where: { id: video.id },
        data: { status: "failed" },
      }),
      prisma.schedule.update({
        where: { id: schedule!.id },
        data: { status: "failed" },
      }),
      prisma.notification.create({
        data: {
          userId: video.brand.userId,
          type: "publish_failed",
          title: `${platformLabel(video.platform)} publish failed`,
          body: reason,
        },
      }),
    ]);
    console.error(`[publish-video] ${video.id} failed: ${reason}`);
  }

  // Resolve the public URL of the rendered video from metadata (set at render).
  const metadata =
    video.metadata && typeof video.metadata === "object"
      ? (video.metadata as Record<string, unknown>)
      : {};
  const videoUrl =
    typeof metadata.videoUrl === "string" ? metadata.videoUrl : null;
  if (!videoUrl) {
    await markFailed("Rendered video is not available yet. Render it first.");
    return;
  }
  const tags = Array.isArray(metadata.tags)
    ? (metadata.tags as unknown[]).map((t) => String(t))
    : [];

  const account = await prisma.platformAccount.findFirst({
    where: {
      userId: video.brand.userId,
      platform: video.platform,
      status: "connected",
    },
  });

  if (!account?.accessToken) {
    await markFailed(
      `No connected ${platformLabel(video.platform)} account. Connect it in Accounts.`
    );
    return;
  }

  const service = getPlatformService(video.platform);

  // Decrypt and, if expired, refresh the access token.
  let accessToken: string;
  try {
    accessToken = decryptToken(account.accessToken);
  } catch {
    await markFailed("Stored access token could not be decrypted.");
    return;
  }

  const isExpired =
    account.tokenExpiresAt !== null && account.tokenExpiresAt < new Date();
  if (isExpired && account.refreshToken) {
    const refreshResult = await service.refreshAccessToken(
      decryptToken(account.refreshToken)
    );
    if (refreshResult.status === "ok") {
      accessToken = refreshResult.data.accessToken;
      await prisma.platformAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encryptToken(refreshResult.data.accessToken),
          refreshToken:
            encryptNullable(refreshResult.data.refreshToken) ??
            account.refreshToken,
          tokenExpiresAt: refreshResult.data.expiresAt ?? null,
          status: "connected",
        },
      });
    } else {
      await prisma.platformAccount.update({
        where: { id: account.id },
        data: { status: "expired" },
      });
      await markFailed(
        `${platformLabel(video.platform)} token expired and could not be refreshed. Reconnect the account.`
      );
      return;
    }
  }

  await prisma.video.update({
    where: { id: video.id },
    data: { status: "publishing" },
  });

  const result = await service.publishVideo({
    accessToken,
    title: video.title,
    description: video.description ?? "",
    tags,
    videoSource: videoUrl,
    thumbnailSource: video.thumbnailAsset?.url ?? null,
    privacyStatus: "private",
    externalId: account.externalId,
  });

  if (result.status === "ok") {
    await prisma.$transaction([
      prisma.video.update({
        where: { id: video.id },
        data: {
          status: "published",
          platformVideoId: result.data.platformPostId,
          publishedAt: new Date(),
          metadata: {
            ...metadata,
            url: result.data.url ?? null,
          },
        },
      }),
      prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: "published" },
      }),
      prisma.notification.create({
        data: {
          userId: video.brand.userId,
          type: "published",
          title: `Published to ${platformLabel(video.platform)}`,
          body: result.data.url ?? null,
        },
      }),
    ]);
    console.log(`[publish-video] ${video.id} published to ${video.platform}.`);
    return;
  }

  const reason =
    result.status === "unsupported" ? result.reason : result.error;
  await markFailed(reason);
}
