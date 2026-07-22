import { z } from "zod";

export const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
] as const;

export const POSTING_FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "several_times_week", label: "Several times a week" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every two weeks" },
  { value: "monthly", label: "Monthly" },
] as const;

const platformEnum = z.enum(["youtube", "tiktok", "linkedin", "facebook"]);

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL (including https://).")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal("").transform(() => undefined));

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6})$/, "Use a 6-digit hex color, e.g. #C8FF00.");

// Full brand payload shared by create and edit flows.
export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required.").max(120),
  industry: optionalText,
  websiteUrl: optionalUrl,
  logoUrl: optionalUrl,
  audience: optionalText,
  tone: optionalText,
  offer: optionalText,
  contentGoals: z.array(z.string().trim().min(1)).max(20).default([]),
  forbiddenTopics: z.array(z.string().trim().min(1)).max(20).default([]),
  preferredCta: optionalText,
  preferredPlatforms: z.array(platformEnum).default([]),
  postingFrequency: z
    .enum(
      POSTING_FREQUENCY_OPTIONS.map((option) => option.value) as [
        string,
        ...string[],
      ]
    )
    .optional()
    .or(z.literal("").transform(() => undefined)),
  brandColors: z.array(hexColor).max(3).default([]),
  videoStylePreference: optionalText,
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

// Per-step schemas power inline validation in the onboarding wizard.
export const brandStepSchemas = [
  brandFormSchema.pick({ name: true, industry: true, websiteUrl: true, logoUrl: true }),
  brandFormSchema.pick({
    audience: true,
    tone: true,
    offer: true,
    contentGoals: true,
    forbiddenTopics: true,
    preferredCta: true,
  }),
  brandFormSchema.pick({
    preferredPlatforms: true,
    postingFrequency: true,
    brandColors: true,
    videoStylePreference: true,
  }),
] as const;
