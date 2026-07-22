import type { Platform } from "./platform";

// Structured output shapes produced by the AI agents. The `ai` package validates
// LLM responses against Zod schemas that mirror these types.

export type TopicSuggestion = {
  title: string;
  angle: string;
  rationale: string;
};

export type GeneratedPost = {
  platform: Platform;
  content: string;
  hashtags: string[];
  imageIdea: string;
};

export type QualityScore = {
  overall: number; // 0-100
  brandRelevance: number;
  clarity: number;
  platformFit: number;
  riskLevel: "low" | "medium" | "high";
  duplicateRisk: "low" | "medium" | "high";
  issues: string[];
  approved: boolean;
};

export type GeneratedDraft = {
  post: GeneratedPost;
  quality: QualityScore;
};

// A single narrated scene in a generated video script. `durationSeconds` drives
// the Remotion timeline and the pacing of on-screen kinetic text.
export type VideoScene = {
  narration: string;
  onScreenText: string;
  durationSeconds: number;
};

// Structured YouTube video script produced by the Writer agent (video mode).
export type YouTubeScript = {
  title: string;
  description: string;
  tags: string[];
  scenes: VideoScene[];
};
