"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateVideoAction } from "@/lib/videos/actions";

type BrandOption = { id: string; name: string };

export function CreateVideoForm({
  brands,
  llmConfigured,
}: {
  brands: BrandOption[];
  llmConfigured: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [topicHint, setTopicHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await generateVideoAction({ brandId, topicHint });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(
        "Script generated. Rendering the video in the background — it will appear below when ready."
      );
      setTopicHint("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New YouTube video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!llmConfigured ? (
          <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
            No AI provider configured. Add GEMINI_API_KEY (or OPENAI_API_KEY) to
            generate a script.
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="video-brand">Brand</Label>
          <select
            id="video-brand"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
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
          <Label htmlFor="video-topic">Topic hint (optional)</Label>
          <Input
            id="video-topic"
            value={topicHint}
            onChange={(event) => setTopicHint(event.target.value)}
            placeholder="e.g. how our product saves time, a customer story..."
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
            {notice}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isPending || !brandId}
        >
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Clapperboard aria-hidden />
          )}
          Generate video
        </Button>
      </CardContent>
    </Card>
  );
}
