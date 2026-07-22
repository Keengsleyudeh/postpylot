import type { Platform } from "@postpylot/shared";

// The subset of brand fields the agents need to produce on-brand content.
export type BrandContext = {
  id: string;
  name: string;
  industry?: string | null;
  audience?: string | null;
  tone?: string | null;
  offer?: string | null;
  contentGoals: string[];
  forbiddenTopics: string[];
  preferredCta?: string | null;
};

export type GenerateRequest = {
  brand: BrandContext;
  platforms: Platform[];
  topicHint?: string;
};
