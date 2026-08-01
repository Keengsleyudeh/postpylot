import { platformLabel, type Platform } from "@postpylot/shared";

import type { BrandContext } from "./types";

function brandBrief(brand: BrandContext): string {
  const lines = [
    `Brand: ${brand.name}`,
    brand.industry ? `Industry: ${brand.industry}` : null,
    brand.audience ? `Audience: ${brand.audience}` : null,
    brand.tone ? `Voice/tone: ${brand.tone}` : null,
    brand.offer ? `Core offer: ${brand.offer}` : null,
    brand.contentGoals.length
      ? `Content goals: ${brand.contentGoals.join(", ")}`
      : null,
    brand.preferredCta ? `Preferred CTA: ${brand.preferredCta}` : null,
    brand.forbiddenTopics.length
      ? `Never mention: ${brand.forbiddenTopics.join(", ")}`
      : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export const TOPIC_SYSTEM =
  "You are the Topic Agent for a social media automation platform. You choose a single, timely, non-generic content topic for a brand. Respond ONLY with JSON matching: { \"title\": string, \"angle\": string, \"rationale\": string }.";

export function topicPrompt(brand: BrandContext, topicHint?: string): string {
  return [
    brandBrief(brand),
    topicHint ? `\nThe user suggested this direction: ${topicHint}` : "",
    "\nPick ONE specific topic that fits the brand and would perform well right now. Avoid duplicates of obvious evergreen topics. Keep it concrete.",
  ].join("");
}

export const WRITER_SYSTEM =
  'You are the Writer Agent for a social media automation platform. You write a single, ready-to-publish post for one platform. Match the brand voice, respect forbidden topics, and never invent facts about the brand. Respond ONLY with JSON matching: { "platform": string, "content": string, "hashtags": string[], "imageIdea": string }. If you include platform, it MUST be exactly one of these lowercase values: youtube, tiktok, linkedin, facebook.';

export function writerPrompt(
  brand: BrandContext,
  platform: Platform,
  topic: { title: string; angle: string }
): string {
  const guidance: Record<Platform, string> = {
    linkedin:
      "LinkedIn: professional, insightful, 1-3 short paragraphs, at most 3 hashtags. No clickbait.",
    facebook:
      "Facebook Page: warm and conversational, 1-2 short paragraphs, up to 3 hashtags, include a soft CTA.",
    youtube:
      "YouTube: write a compelling video description with a hook in the first line and 3-5 hashtags.",
    tiktok:
      "TikTok: punchy caption with a strong hook and 3-5 trending-style hashtags.",
  };

  return [
    brandBrief(brand),
    `\nPlatform: ${platformLabel(platform)}`,
    `Topic: ${topic.title}`,
    `Angle: ${topic.angle}`,
    `\nStyle guidance: ${guidance[platform]}`,
    "\nWrite the post now. `imageIdea` should describe a simple on-brand graphic to accompany the post.",
  ].join("");
}

export const YOUTUBE_SCRIPT_SYSTEM =
  'You are the Writer Agent in video mode. You write a short, punchy YouTube video script that stays tightly on the given topic — never drift to unrelated trends. The script must have a strong hook in the first scene (first ~3 seconds), clear middle points, and a call to action at the end. Keep total runtime roughly 15-30 seconds. Respond ONLY with JSON matching: { "title": string, "description": string, "tags": string[], "scenes": [{ "narration": string, "onScreenText": string, "durationSeconds": number, "role": "hook"|"point"|"cta" }] }. `narration` is what the voice-over says and MUST name the topic\'s concrete subject. `onScreenText` is a short kinetic caption (a few words) that is a specific claim or phrase from that topic — never generic filler like "Here\'s why" or "Let\'s dig in". `durationSeconds` is 2-8. `role` is "hook" for the opening scene, "point" for middle scenes, "cta" for the final scene. Use 2-6 scenes (prefer 3-5). First scene role=hook, last scene role=cta.';

export function youtubeScriptPrompt(
  brand: BrandContext,
  topic: { title: string; angle: string },
  userTopic?: string
): string {
  return [
    brandBrief(brand),
    `\nTopic: ${topic.title}`,
    `Angle: ${topic.angle}`,
    userTopic
      ? `\nUSER TOPIC (mandatory — every scene must stay about this exact subject; do not reinterpret or swap topics): ${userTopic}`
      : "",
    "\nWrite a YouTube video script now. Open with a scroll-stopping hook that names the topic, keep each scene a concrete point about that topic, and end with the brand's call to action. `title` must be <= 100 characters, compelling, and clearly about the topic. `description` should include a hook line and 3-5 hashtags. Total of all `durationSeconds` should be about 15-30. Prefer 3-5 short scenes. Assign role=hook to scene 1, role=point to middle scenes, role=cta to the last scene.",
  ].join("");
}

export const QUALITY_SYSTEM =
  "You are the Quality Control Agent. You score a draft social post for a brand before it can be auto-published. Be strict: block if it is off-brand, risky, empty, or mentions forbidden topics. Respond ONLY with JSON matching: { \"overall\": number, \"brandRelevance\": number, \"clarity\": number, \"platformFit\": number, \"riskLevel\": \"low\"|\"medium\"|\"high\", \"duplicateRisk\": \"low\"|\"medium\"|\"high\", \"issues\": string[], \"approved\": boolean }. All numbers are 0-100.";

export function qualityPrompt(
  brand: BrandContext,
  platform: Platform,
  content: string
): string {
  return [
    brandBrief(brand),
    `\nPlatform: ${platformLabel(platform)}`,
    "\nDraft to evaluate:\n---\n",
    content,
    "\n---\nScore it. Set approved=false if riskLevel is high, brandRelevance < 50, or it violates forbidden topics.",
  ].join("");
}
