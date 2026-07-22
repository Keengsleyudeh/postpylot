import { z } from "zod";

export const generateVideoSchema = z.object({
  brandId: z.string().min(1),
  topicHint: z.string().trim().max(300).optional(),
});

export const videoIdSchema = z.object({
  videoId: z.string().min(1),
});

export const scheduleVideoSchema = z.object({
  videoId: z.string().min(1),
  scheduledAt: z.coerce.date(),
});

export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;
export type ScheduleVideoInput = z.infer<typeof scheduleVideoSchema>;
