import { z } from "zod";
import { PLATFORMS } from "@postpylot/shared";

// Zod schemas mirror the structured types in @postpylot/shared/content and are
// used to validate raw LLM JSON before it is trusted by the app.

export const topicSuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  angle: z.string().min(1).max(400),
  rationale: z.string().min(1).max(600),
});

export const generatedPostSchema = z.object({
  platform: z.enum(PLATFORMS),
  content: z.string().min(1).max(6000),
  hashtags: z.array(z.string().min(1).max(60)).max(15).default([]),
  imageIdea: z.string().min(1).max(400),
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

export type TopicSuggestionParsed = z.infer<typeof topicSuggestionSchema>;
export type GeneratedPostParsed = z.infer<typeof generatedPostSchema>;
export type QualityScoreParsed = z.infer<typeof qualityScoreSchema>;
