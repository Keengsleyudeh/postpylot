import { z } from "zod";
import { PLATFORMS } from "@postpylot/shared";

// Zod schemas mirror the structured types in @postpylot/shared/content and are
// used to validate raw LLM JSON before it is trusted by the app.

export const topicSuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  angle: z.string().min(1).max(400),
  rationale: z.string().min(1).max(600),
});

export const generatedPostContentSchema = z.object({
  content: z.string().min(1).max(6000),
  hashtags: z.array(z.string().min(1).max(60)).max(15).default([]),
  imageIdea: z.string().min(1).max(400),
});

export const generatedPostSchema = generatedPostContentSchema.extend({
  // Normalize casing so "YouTube" / "LinkedIn" from the model still parse; the
  // writer agent overwrites this with the requested platform either way.
  platform: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(PLATFORMS)
  ),
});

export const qualityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  brandRelevance: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  platformFit: z.number().min(0).max(100),
  riskLevel: z.enum(["low", "medium", "high"]),
  duplicateRisk: z.enum(["low", "medium", "high"]),
  issues: z.array(z.string()).max(20).default([]),
  approved: z.boolean(),
});

export const videoSceneSchema = z.object({
  narration: z.string().min(1).max(800),
  onScreenText: z.string().min(1).max(120),
  durationSeconds: z.number().min(2).max(20),
});

export const youtubeScriptSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(4000),
  tags: z.array(z.string().min(1).max(60)).max(15).default([]),
  scenes: z.array(videoSceneSchema).min(2).max(12),
});

export type TopicSuggestionParsed = z.infer<typeof topicSuggestionSchema>;
export type GeneratedPostContentParsed = z.infer<typeof generatedPostContentSchema>;
export type GeneratedPostParsed = z.infer<typeof generatedPostSchema>;
export type QualityScoreParsed = z.infer<typeof qualityScoreSchema>;
export type YouTubeScriptParsed = z.infer<typeof youtubeScriptSchema>;
