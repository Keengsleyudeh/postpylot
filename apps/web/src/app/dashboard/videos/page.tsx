import type { Metadata } from "next";
import Link from "next/link";
import { Video } from "lucide-react";

import { hasLlmProvider } from "@postpylot/ai";
import { prisma } from "@postpylot/db";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { CreateVideoForm } from "@/components/videos/create-video-form";
import { VideosList, type VideoView } from "@/components/videos/videos-list";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { ensureAppUser } from "@/lib/users/ensure-app-user";
import { getVideosForUser } from "@/lib/videos/queries";

export const metadata: Metadata = {
  title: "Videos",
};

function readMetaString(metadata: unknown, key: string): string | null {
  if (metadata && typeof metadata === "object" && key in metadata) {
    const value = (metadata as Record<string, unknown>)[key];
    return typeof value === "string" ? value : null;
  }
  return null;
}

export default async function VideosPage() {
  const user = await getDashboardUser();
  await ensureAppUser(user);

  const [brands, videos] = await Promise.all([
    prisma.brand.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
    getVideosForUser(user.id),
  ]);

  const views: VideoView[] = videos.map((video) => ({
    id: video.id,
    brandName: video.brand.name,
    title: video.title,
    status: video.status,
    thumbnailUrl:
      video.thumbnailAsset?.url ?? readMetaString(video.metadata, "thumbnailUrl"),
    videoUrl: readMetaString(video.metadata, "videoUrl"),
    publishedUrl: readMetaString(video.metadata, "url"),
    scheduledAt: video.schedules[0]?.scheduledAt.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Videos"
        description="Generate YouTube videos with AI scripts, rendered in the background worker (Remotion + Piper), then schedule and publish."
      />

      {brands.length === 0 ? (
        <EmptyState
          icon={<Video aria-hidden />}
          title="Set up a brand first"
          description="Video generation needs a brand profile to match your voice and audience."
          action={
            <Button render={<Link href="/dashboard/brands/new" />} nativeButton={false}>
              Create brand
            </Button>
          }
        />
      ) : (
        <>
          <CreateVideoForm
            brands={brands}
            llmConfigured={hasLlmProvider()}
          />
          {views.length === 0 ? (
            <EmptyState
              icon={<Video aria-hidden />}
              title="No videos yet"
              description="Generate your first YouTube video above. It renders in the background and appears here when ready."
            />
          ) : (
            <VideosList videos={views} />
          )}
        </>
      )}
    </div>
  );
}
