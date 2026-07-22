import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";

import type { Platform } from "@postpylot/shared";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PostsList, type PostView } from "@/components/posts/posts-list";
import { Button } from "@/components/ui/button";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getPostsForUser } from "@/lib/posts/queries";

export const metadata: Metadata = {
  title: "Posts",
};

function readUrl(metadata: unknown): string | null {
  if (metadata && typeof metadata === "object" && "url" in metadata) {
    const value = (metadata as Record<string, unknown>).url;
    return typeof value === "string" ? value : null;
  }
  return null;
}

export default async function PostsPage() {
  const user = await getDashboardUser();
  const posts = await getPostsForUser(user.id);

  const views: PostView[] = posts.map((post) => ({
    id: post.id,
    brandName: post.brand.name,
    platform: post.platform as Platform,
    status: post.status,
    content: post.content,
    hashtags: post.hashtags,
    imageUrl: post.mediaAsset?.url ?? null,
    publishedUrl: readUrl(post.metadata),
    scheduledAt: post.schedules[0]?.scheduledAt.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Posts"
        description="Review drafts, schedule, publish, and track status across your platforms."
      />

      {views.length === 0 ? (
        <EmptyState
          icon={<Send aria-hidden />}
          title="No posts yet"
          description="Generate content to create drafts, then schedule or publish them here."
          action={
            <Button render={<Link href="/dashboard/generate" />} nativeButton={false}>
              Generate content
            </Button>
          }
        />
      ) : (
        <PostsList posts={views} />
      )}
    </div>
  );
}
