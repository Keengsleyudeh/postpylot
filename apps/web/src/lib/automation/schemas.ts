import { z } from "zod";
import { PLATFORMS } from "@postpylot/shared";

export const createRuleSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required.").max(120),
  platform: z.enum(PLATFORMS).optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
