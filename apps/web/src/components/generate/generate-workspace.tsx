"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Image as ImageIcon,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import {
  PLATFORM_LABELS,
  type GeneratedDraft,
  type Platform,
  type TopicSuggestion,
} from "@postpylot/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlatformPicker } from "@/components/brands/platform-picker";
import {
  generateDraftsAction,
  saveDraftAction,
} from "@/lib/generate/actions";
import { generateImageAction } from "@/lib/media/actions";

type BrandOption = {
  id: string;
  name: string;
  preferredPlatforms: Platform[];
};

type DraftState = GeneratedDraft & {
  savedPostId: string | null;
  imageUrl: string | null;
  busy: "idle" | "saving" | "imaging";
  error: string | null;
};

function toDraftState(drafts: GeneratedDraft[]): DraftState[] {
  return drafts.map((draft) => ({
    ...draft,
    savedPostId: null,
    imageUrl: null,
    busy: "idle",
    error: null,
  }));
}

function scoreTone(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function GenerateWorkspace({
  brands,
  llmConfigured,
}: {
  brands: BrandOption[];
  llmConfigured: boolean;
}) {
  const router = useRouter();
  const [isGenerating, startGenerate] = useTransition();

  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const initialPlatforms =
    brands[0]?.preferredPlatforms?.length
      ? brands[0].preferredPlatforms
      : (["linkedin", "facebook"] as Platform[]);
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [topicHint, setTopicHint] = useState("");

  const [topic, setTopic] = useState<TopicSuggestion | null>(null);
  const [drafts, setDrafts] = useState<DraftState[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleBrandChange(id: string) {
    setBrandId(id);
    const brand = brands.find((b) => b.id === id);
    if (brand?.preferredPlatforms.length) {
      setPlatforms(brand.preferredPlatforms);
    }
  }

  function handleGenerate() {
    setError(null);
    startGenerate(async () => {
      const result = await generateDraftsAction({ brandId, platforms, topicHint });
      if (!result.ok) {
        setError(result.error);
        setTopic(null);
        setDrafts([]);
        return;
      }
      setTopic(result.topic);
      setDrafts(toDraftState(result.drafts));
    });
  }

  function patchDraft(index: number, patch: Partial<DraftState>) {
    setDrafts((prev) =>
      prev.map((draft, i) => (i === index ? { ...draft, ...patch } : draft))
    );
  }

  async function handleSave(index: number) {
    const draft = drafts[index];
    patchDraft(index, { busy: "saving", error: null });
    const result = await saveDraftAction({
      brandId,
      platform: draft.post.platform,
      topicTitle: topic?.title,
      content: draft.post.content,
      hashtags: draft.post.hashtags,
      imageIdea: draft.post.imageIdea,
    });
    if (!result.ok) {
      patchDraft(index, { busy: "idle", error: result.error });
      return;
    }
    patchDraft(index, { busy: "idle", savedPostId: result.postId });
    router.refresh();
  }

  async function handleGenerateImage(index: number) {
    const draft = drafts[index];
    if (!draft.savedPostId) return;
    patchDraft(index, { busy: "imaging", error: null });
    const result = await generateImageAction({ postId: draft.savedPostId });
    if (!result.ok) {
      patchDraft(index, { busy: "idle", error: result.error });
      return;
    }
    patchDraft(index, { busy: "idle", imageUrl: result.url });
    router.refresh();
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!llmConfigured ? (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              No AI provider configured. Add GEMINI_API_KEY (or OPENAI_API_KEY)
              to generate content.
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <select
              id="brand"
              value={brandId}
              onChange={(event) => handleBrandChange(event.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Platforms</Label>
            <PlatformPicker
              value={platforms}
              onChange={(next) => setPlatforms(next as Platform[])}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topicHint">Topic hint (optional)</Label>
            <Input
              id="topicHint"
              value={topicHint}
              onChange={(event) => setTopicHint(event.target.value)}
              placeholder="e.g. product launch, industry trend, tips..."
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !brandId || platforms.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Sparkles aria-hidden />
            )}
            Generate drafts
          </Button>
        </CardContent>
      </Card>

      {topic ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" aria-hidden />
              {topic.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{topic.angle}</p>
            <p className="text-xs">{topic.rationale}</p>
          </CardContent>
        </Card>
      ) : null}

      {drafts.map((draft, index) => (
        <Card key={`${draft.post.platform}-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">
                {PLATFORM_LABELS[draft.post.platform]}
              </Badge>
              <span
                className={`font-mono text-xs ${scoreTone(draft.quality.overall)}`}
              >
                Quality {draft.quality.overall}/100
              </span>
              {draft.quality.approved ? (
                <Badge variant="secondary">
                  <Check aria-hidden /> Approved
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle aria-hidden /> Review
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={draft.post.content}
              onChange={(event) =>
                patchDraft(index, {
                  post: { ...draft.post, content: event.target.value },
                })
              }
              className="min-h-32"
            />

            {draft.post.hashtags.length ? (
              <div className="flex flex-wrap gap-1.5">
                {draft.post.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
            ) : null}

            {draft.quality.issues.length ? (
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                {draft.quality.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            ) : null}

            {draft.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.imageUrl}
                alt="Generated media"
                className="w-full max-w-sm rounded-lg border border-border"
              />
            ) : null}

            {draft.error ? (
              <p className="text-sm text-destructive" role="alert">
                {draft.error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={draft.savedPostId ? "outline" : "default"}
                onClick={() => handleSave(index)}
                disabled={draft.busy !== "idle" || Boolean(draft.savedPostId)}
              >
                {draft.busy === "saving" ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : draft.savedPostId ? (
                  <Check aria-hidden />
                ) : (
                  <Save aria-hidden />
                )}
                {draft.savedPostId ? "Saved to Posts" : "Save draft"}
              </Button>

              {draft.savedPostId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGenerateImage(index)}
                  disabled={draft.busy !== "idle"}
                >
                  {draft.busy === "imaging" ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <ImageIcon aria-hidden />
                  )}
                  Generate image
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
