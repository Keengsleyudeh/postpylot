import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import ffmpegPath from "ffmpeg-static";

import { prisma } from "@postpylot/db";

import { COMPOSITION_ID } from "../remotion/Root";
import type { YouTubeHorizontalProps } from "../remotion/YouTubeHorizontal";
import { uploadBuffer, uploadFile } from "../media/storage";
import { renderThumbnail } from "../media/thumbnail";
import {
  getWavDurationSeconds,
  isVoiceConfigured,
  synthesize,
} from "../voice/piper";

const FPS = 30;

type Scene = {
  narration: string;
  onScreenText: string;
  durationSeconds: number;
};

function parseScenes(metadata: unknown): Scene[] {
  if (
    metadata &&
    typeof metadata === "object" &&
    "scenes" in metadata &&
    Array.isArray((metadata as Record<string, unknown>).scenes)
  ) {
    const raw = (metadata as { scenes: unknown[] }).scenes;
    return raw
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const scene = s as Record<string, unknown>;
        return {
          narration: String(scene.narration ?? ""),
          onScreenText: String(scene.onScreenText ?? ""),
          durationSeconds: Number(scene.durationSeconds ?? 4) || 4,
        } satisfies Scene;
      })
      .filter((s): s is Scene => s !== null);
  }
  return [];
}

// Muxes a narration WAV into a silent MP4 using ffmpeg-static. Output length is
// the longest input (video is rendered at least as long as the narration).
async function muxAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<void> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary not found.");
  }
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(ffmpegPath as string, [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      outputPath,
    ]);
    let stderr = "";
    child.stderr.on("data", (c) => (stderr += String(c)));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolvePromise()
        : reject(new Error(`ffmpeg mux failed (${code}): ${stderr.slice(-500)}`))
    );
  });
}

export async function handleRenderVideo(videoId: string): Promise<void> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { brand: true },
  });

  if (!video) {
    console.warn(`[render-video] video ${videoId} not found; skipping.`);
    return;
  }

  async function markFailed(reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.video.update({
        where: { id: video!.id },
        data: { status: "failed" },
      }),
      prisma.notification.create({
        data: {
          userId: video!.brand.userId,
          type: "render_failed",
          title: `Video render failed: ${video!.title}`,
          body: reason,
        },
      }),
    ]);
    console.error(`[render-video] ${videoId} failed: ${reason}`);
  }

  const scenes = parseScenes(video.metadata);
  if (scenes.length === 0) {
    await markFailed("Video has no scenes to render.");
    return;
  }

  const workDir = join(tmpdir(), `postpylot-video-${videoId}`);
  await mkdir(workDir, { recursive: true });

  try {
    const brandColors = Array.isArray(video.brand.brandColors)
      ? (video.brand.brandColors as unknown[]).filter(
          (c): c is string => typeof c === "string"
        )
      : [];
    const accent = brandColors[0] ?? "#C8FF00";

    const visualSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

    // 1. Voice-over (Piper). Optional: if not configured, render silent.
    let narrationSeconds = 0;
    let narrationPath: string | null = null;
    if (isVoiceConfigured()) {
      const narration = scenes.map((s) => s.narration).join("\n");
      narrationPath = join(workDir, "narration.wav");
      await synthesize(narration, narrationPath);
      narrationSeconds = await getWavDurationSeconds(narrationPath);
    }

    const totalDurationSeconds = Math.max(visualSeconds, narrationSeconds, 3);

    // 2. Bundle + render the Remotion composition (visuals only).
    await ensureBrowser();
    const entryPoint = resolve(import.meta.dirname, "../remotion/entry.ts");
    const serveUrl = await bundle({ entryPoint });

    const inputProps: YouTubeHorizontalProps = {
      brandName: video.brand.name,
      title: video.title,
      accent,
      scenes: scenes.map((s) => ({
        onScreenText: s.onScreenText,
        durationSeconds: s.durationSeconds,
      })),
      fps: FPS,
      totalDurationSeconds,
    };

    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    const silentPath = join(workDir, "silent.mp4");
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: silentPath,
      inputProps,
    });

    // 3. Mux narration if we have it.
    let finalPath = silentPath;
    if (narrationPath) {
      finalPath = join(workDir, "final.mp4");
      await muxAudio(silentPath, narrationPath, finalPath);
    }

    // 4. Thumbnail.
    const thumb = await renderThumbnail({
      title: video.title,
      brandName: video.brand.name,
      accent,
    });

    // 5. Upload to Storage.
    const base = `${video.brandId}/videos/${video.id}-${Date.now()}`;
    const uploadedVideo = await uploadFile({
      localPath: finalPath,
      storagePath: `${base}.mp4`,
      contentType: "video/mp4",
    });
    const uploadedThumb = await uploadBuffer({
      buffer: thumb.buffer,
      storagePath: `${base}.png`,
      contentType: "image/png",
    });

    // 6. Persist: thumbnail MediaAsset + Video updates.
    const thumbnailAsset = await prisma.mediaAsset.create({
      data: {
        brandId: video.brandId,
        type: "thumbnail",
        storagePath: uploadedThumb.storagePath,
        url: uploadedThumb.url,
        mimeType: "image/png",
        width: thumb.width,
        height: thumb.height,
      },
    });

    await prisma.$transaction([
      prisma.video.update({
        where: { id: video.id },
        data: {
          status: "generated",
          storagePath: uploadedVideo.storagePath,
          durationSeconds: Math.round(totalDurationSeconds),
          thumbnailAssetId: thumbnailAsset.id,
          metadata: {
            ...(video.metadata && typeof video.metadata === "object"
              ? (video.metadata as Record<string, unknown>)
              : {}),
            videoUrl: uploadedVideo.url,
            thumbnailUrl: uploadedThumb.url,
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: video.brand.userId,
          type: "video_rendered",
          title: `Video ready: ${video.title}`,
          body: uploadedVideo.url,
        },
      }),
    ]);

    console.log(`[render-video] ${videoId} rendered and uploaded.`);
  } catch (error) {
    await markFailed(
      error instanceof Error ? error.message : "Video render failed."
    );
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
