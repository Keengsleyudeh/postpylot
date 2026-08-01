"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteVideoAction,
  publishVideoNowAction,
  renderVideoAction,
  scheduleVideoAction,
} from "@/lib/videos/actions";

export type VideoView = {
  id: string;
  brandName: string;
  title: string;
  status: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
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
  generated: "secondary",
  draft: "outline",
  failed: "destructive",
  cancelled: "destructive",
};

const DRAFT_POLL_MS = 5000;
/** After this many draft polls, show the worker hint. */
const WORKER_HINT_AFTER_POLLS = 3;

function defaultScheduleValue(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function VideoItem({
  video,
  showWorkerHint,
}: {
  video: VideoView;
  showWorkerHint: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [when, setWhen] = useState(defaultScheduleValue);
  const [error, setError] = useState<string | null>(null);

  const busy = video.status === "publishing";
  const done = video.status === "published";
  const rendering = video.status === "draft";
  const ready =
    video.status === "generated" ||
    video.status === "scheduled" ||
    video.status === "failed";
  const canPublish = ready && !done;
  const canRerender =
    video.status === "failed" ||
    video.status === "generated" ||
    video.status === "draft";

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
          <Badge variant="outline">YouTube</Badge>
          <Badge variant={STATUS_VARIANT[video.status] ?? "outline"}>
            {video.status}
          </Badge>
          <span className="text-xs text-muted-foreground">{video.brandName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              preload="metadata"
              poster={video.thumbnailUrl ?? undefined}
              className="aspect-video w-56 shrink-0 rounded-lg border border-border bg-muted object-cover"
            >
              <track kind="captions" />
            </video>
          ) : video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt=""
              className="aspect-video w-40 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-video w-40 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              {rendering ? "Rendering..." : "No preview"}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{video.title}</p>
            {rendering ? (
              <p className="text-xs text-muted-foreground">
                Rendering in the background. This can take a few minutes.
              </p>
            ) : null}
            {rendering && showWorkerHint ? (
              <p className="text-xs text-warning" role="status">
                Waiting for worker… run{" "}
                <code className="font-mono text-[0.7rem]">npm run worker:dev</code>{" "}
                (or <code className="font-mono text-[0.7rem]">npm run dev:all</code>
                ).
              </p>
            ) : null}
          </div>
        </div>

        {video.scheduledAt && !done ? (
          <p className="text-xs text-muted-foreground">
            Scheduled for {new Date(video.scheduledAt).toLocaleString()}
          </p>
        ) : null}

        {done && video.publishedUrl ? (
          <a
            href={video.publishedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View on YouTube
          </a>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {!done ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {canPublish ? (
              <>
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
                  onClick={() =>
                    run(() =>
                      scheduleVideoAction({ videoId: video.id, scheduledAt: when })
                    )
                  }
                  disabled={isPending || busy}
                >
                  <CalendarClock aria-hidden />
                  Schedule
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    run(() => publishVideoNowAction({ videoId: video.id }))
                  }
                  disabled={isPending || busy}
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <Send aria-hidden />
                  )}
                  Publish now
                </Button>
              </>
            ) : null}

            {canRerender ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => run(() => renderVideoAction({ videoId: video.id }))}
                disabled={isPending || busy}
              >
                <RefreshCw aria-hidden />
                {video.status === "failed"
                  ? "Retry render"
                  : video.status === "draft"
                    ? "Re-queue render"
                    : "Re-render"}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              onClick={() => run(() => deleteVideoAction({ videoId: video.id }))}
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

export function VideosList({ videos }: { videos: VideoView[] }) {
  const router = useRouter();
  const hasDrafts = videos.some((v) => v.status === "draft");
  const [draftPollCount, setDraftPollCount] = useState(0);

  useEffect(() => {
    if (!hasDrafts) {
      setDraftPollCount(0);
      return;
    }

    const id = window.setInterval(() => {
      setDraftPollCount((n) => n + 1);
      router.refresh();
    }, DRAFT_POLL_MS);

    return () => window.clearInterval(id);
  }, [hasDrafts, router]);

  const showWorkerHint = hasDrafts && draftPollCount >= WORKER_HINT_AFTER_POLLS;

  return (
    <div className="grid gap-3">
      {videos.map((video) => (
        <VideoItem
          key={video.id}
          video={video}
          showWorkerHint={showWorkerHint && video.status === "draft"}
        />
      ))}
    </div>
  );
}
