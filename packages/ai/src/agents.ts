import type {
  GeneratedDraft,
  GeneratedPost,
  Platform,
  QualityScore,
  TopicSuggestion,
  YouTubeScript,
} from "@postpylot/shared";

import { generateJson } from "./client";
import { withAgentLog } from "./logging";
import {
  QUALITY_SYSTEM,
  TOPIC_SYSTEM,
  WRITER_SYSTEM,
  YOUTUBE_SCRIPT_SYSTEM,
  qualityPrompt,
  topicPrompt,
  writerPrompt,
  youtubeScriptPrompt,
} from "./prompts";
import {
  generatedPostSchema,
  qualityScoreSchema,
  topicSuggestionSchema,
  youtubeScriptSchema,
} from "./schemas";
import type { BrandContext, GenerateRequest } from "./types";

// Research Agent — MVP stub. Returns a structured (empty) trends payload so the
// pipeline shape is stable; real trend sources arrive in a later phase.
export async function researchAgent(
  brand: BrandContext
): Promise<{ trends: string[]; sources: string[] }> {
  return withAgentLog(
    { agent: "research", brandId: brand.id, input: { brand: brand.name } },
    async () => ({ trends: [], sources: [] })
  );
}

// Topic Agent — chooses the next topic for the brand.
export async function topicAgent(
  brand: BrandContext,
  topicHint?: string
): Promise<TopicSuggestion> {
  return withAgentLog(
    { agent: "topic", brandId: brand.id, input: { topicHint: topicHint ?? null } },
    () =>
      generateJson(
        topicSuggestionSchema,
        TOPIC_SYSTEM,
        topicPrompt(brand, topicHint)
      )
  );
}

// Writer Agent — writes a post for a single platform.
export async function writerAgent(
  brand: BrandContext,
  platform: Platform,
  topic: TopicSuggestion
): Promise<GeneratedPost> {
  return withAgentLog(
    { agent: "writer", brandId: brand.id, input: { platform, topic: topic.title } },
    async () => {
      const parsed = await generateJson(
        generatedPostSchema,
        WRITER_SYSTEM,
        writerPrompt(brand, platform, topic)
      );
      // Trust our platform target over whatever the model echoed back.
      return { ...parsed, platform } satisfies GeneratedPost;
    }
  );
}

// Writer Agent (video mode) — writes a YouTube video script for a topic.
export async function youtubeScriptAgent(
  brand: BrandContext,
  topic: TopicSuggestion
): Promise<YouTubeScript> {
  return withAgentLog(
    { agent: "writer-video", brandId: brand.id, input: { topic: topic.title } },
    () =>
      generateJson(
        youtubeScriptSchema,
        YOUTUBE_SCRIPT_SYSTEM,
        youtubeScriptPrompt(brand, topic)
      )
  );
}

// Quality Control Agent — scores a draft before it can be published.
export async function qualityControlAgent(
  brand: BrandContext,
  post: GeneratedPost
): Promise<QualityScore> {
  return withAgentLog(
    { agent: "quality-control", brandId: brand.id, input: { platform: post.platform } },
    () =>
      generateJson(
        qualityScoreSchema,
        QUALITY_SYSTEM,
        qualityPrompt(brand, post.platform, post.content)
      )
  );
}

// High-level orchestration used by the Generate workspace: pick a topic, then
// write + score one draft per requested platform.
export async function generateDrafts(request: GenerateRequest): Promise<{
  topic: TopicSuggestion;
  drafts: GeneratedDraft[];
}> {
  const { brand, platforms, topicHint } = request;

  const topic = await topicAgent(brand, topicHint);

  const drafts = await Promise.all(
    platforms.map(async (platform) => {
      const post = await writerAgent(brand, platform, topic);
      const quality = await qualityControlAgent(brand, post);
      return { post, quality } satisfies GeneratedDraft;
    })
  );

  return { topic, drafts };
}
