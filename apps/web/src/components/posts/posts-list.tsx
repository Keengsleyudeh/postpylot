"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Send, Trash2 } from "lucide-react";
import { PLATFORM_LABELS, type Platform } from "@postpylot/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deletePostAction,
  publishPostNowAction,
  schedulePostAction,
} from "@/lib/posts/actions";

export type PostView = {
  id: string;
  brandName: string;
  platform: Platform;
  status: string;
  content: string;
  hashtags: string[];
  imageUrl: string | null;
  publishedUrl: string | null;
  scheduledAt: string | null;
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  published: "secondary",
  publishing: "default",
  scheduled: "outline",
  generated: "outline",
  draft: "outline",
  failed: "destructive",
  cancelled: "destructive",
};

function defaultScheduleValue(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PostItem({ post }: { post: PostView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [when, setWhen] = useState(defaultScheduleValue);
  const [error, setError] = useState<string | null>(null);

  const busy = post.status === "publishing";
  const done = post.status === "published";

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline">{PLATFORM_LABELS[post.platform]}</Badge>
          <Badge variant={STATUS_VARIANT[post.status] ?? "outline"}>
            {post.status}
          </Badge>
          <span className="text-xs text-muted-foreground">{post.brandName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="size-20 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : null}
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {post.content}
          </p>
        </div>

        {post.hashtags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </Badge>
            ))}
          </div>
        ) : null}

        {post.scheduledAt && !done ? (
          <p className="text-xs text-muted-foreground">
            Scheduled for {new Date(post.scheduledAt).toLocaleString()}
          </p>
        ) : null}

        {done && post.publishedUrl ? (
          <a
            href={post.publishedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View published post
          </a>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {!done ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Input
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className="w-auto"
              disabled={isPending || busy}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => run(() => schedulePostAction({ postId: post.id, scheduledAt: when }))}
              disabled={isPending || busy}
            >
              <CalendarClock aria-hidden />
              Schedule
            </Button>
            <Button
              type="button"
              onClick={() => run(() => publishPostNowAction({ postId: post.id }))}
              disabled={isPending || busy}
            >
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Send aria-hidden />
              )}
              Publish now
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => run(() => deletePostAction({ postId: post.id }))}
              disabled={isPending || busy}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PostsList({ posts }: { posts: PostView[] }) {
  return (
    <div className="grid gap-3">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
