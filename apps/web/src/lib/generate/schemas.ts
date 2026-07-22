import { z } from "zod";
import { PLATFORMS } from "@postpylot/shared";

export const generateInputSchema = z.object({
  brandId: z.string().min(1),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Pick at least one platform."),
  topicHint: z.string().trim().max(300).optional(),
});

export const saveDraftSchema = z.object({
  brandId: z.string().min(1),
  platform: z.enum(PLATFORMS),
  topicTitle: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1).max(6000),
  hashtags: z.array(z.string().trim().min(1).max(60)).max(15).default([]),
  imageIdea: z.string().trim().max(400).optional(),
});

export type GenerateInput = z.infer<typeof generateInputSchema>;
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;
