"use client";

import type { BrandFormValues } from "@/lib/brands/schemas";
import { POSTING_FREQUENCY_OPTIONS } from "@/lib/brands/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlatformPicker } from "@/components/brands/platform-picker";
import { cn } from "@/lib/utils";

// Client-side form state keeps free-text fields as strings so inputs stay
// controlled; arrays are parsed into the payload on submit.
export type BrandFormState = {
  name: string;
  industry: string;
  websiteUrl: string;
  logoUrl: string;
  audience: string;
  tone: string;
  offer: string;
  contentGoals: string;
  forbiddenTopics: string;
  preferredCta: string;
  preferredPlatforms: string[];
  postingFrequency: string;
  brandColors: string[];
  videoStylePreference: string;
};

export const EMPTY_BRAND_FORM: BrandFormState = {
  name: "",
  industry: "",
  websiteUrl: "",
  logoUrl: "",
  audience: "",
  tone: "",
  offer: "",
  contentGoals: "",
  forbiddenTopics: "",
  preferredCta: "",
  preferredPlatforms: [],
  postingFrequency: "",
  brandColors: [],
  videoStylePreference: "",
};

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function brandFormStateToValues(state: BrandFormState): BrandFormValues {
  return {
    name: state.name.trim(),
    industry: state.industry,
    websiteUrl: state.websiteUrl,
    logoUrl: state.logoUrl,
    audience: state.audience,
    tone: state.tone,
    offer: state.offer,
    contentGoals: splitList(state.contentGoals),
    forbiddenTopics: splitList(state.forbiddenTopics),
    preferredCta: state.preferredCta,
    preferredPlatforms: state.preferredPlatforms as BrandFormValues["preferredPlatforms"],
    postingFrequency: state.postingFrequency as BrandFormValues["postingFrequency"],
    brandColors: state.brandColors.filter(Boolean),
    videoStylePreference: state.videoStylePreference,
  };
}

type Errors = Record<string, string[] | undefined>;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

function Field({
  id,
  label,
  hint,
  children,
  errors,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
  errors?: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError messages={errors} />
    </div>
  );
}

type SectionProps = {
  state: BrandFormState;
  onChange: (patch: Partial<BrandFormState>) => void;
  errors: Errors;
};

export function BrandBasicsFields({ state, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-4">
      <Field id="name" label="Brand name" errors={errors.name}>
        <Input
          id="name"
          value={state.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Acme Studios"
          aria-invalid={Boolean(errors.name?.length)}
          autoFocus
        />
      </Field>
      <Field id="industry" label="Industry" errors={errors.industry}>
        <Input
          id="industry"
          value={state.industry}
          onChange={(event) => onChange({ industry: event.target.value })}
          placeholder="SaaS, fitness, education..."
        />
      </Field>
      <Field id="websiteUrl" label="Website" errors={errors.websiteUrl}>
        <Input
          id="websiteUrl"
          value={state.websiteUrl}
          onChange={(event) => onChange({ websiteUrl: event.target.value })}
          placeholder="https://example.com"
          aria-invalid={Boolean(errors.websiteUrl?.length)}
        />
      </Field>
      <Field
        id="logoUrl"
        label="Logo URL"
        hint="Paste a hosted image URL. File uploads arrive in a later phase."
        errors={errors.logoUrl}
      >
        <Input
          id="logoUrl"
          value={state.logoUrl}
          onChange={(event) => onChange({ logoUrl: event.target.value })}
          placeholder="https://example.com/logo.png"
          aria-invalid={Boolean(errors.logoUrl?.length)}
        />
      </Field>
    </div>
  );
}

export function BrandVoiceFields({ state, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-4">
      <Field id="audience" label="Target audience" errors={errors.audience}>
        <Textarea
          id="audience"
          value={state.audience}
          onChange={(event) => onChange({ audience: event.target.value })}
          placeholder="Who are you creating content for?"
        />
      </Field>
      <Field id="tone" label="Voice & tone" errors={errors.tone}>
        <Input
          id="tone"
          value={state.tone}
          onChange={(event) => onChange({ tone: event.target.value })}
          placeholder="Confident, friendly, technical..."
        />
      </Field>
      <Field
        id="contentGoals"
        label="Content goals"
        hint="One per line, or comma-separated."
        errors={errors.contentGoals}
      >
        <Textarea
          id="contentGoals"
          value={state.contentGoals}
          onChange={(event) => onChange({ contentGoals: event.target.value })}
          placeholder={"Grow awareness\nDrive signups\nEducate developers"}
        />
      </Field>
      <Field id="offer" label="Core offer" errors={errors.offer}>
        <Input
          id="offer"
          value={state.offer}
          onChange={(event) => onChange({ offer: event.target.value })}
          placeholder="What do you sell or promote?"
        />
      </Field>
      <Field
        id="forbiddenTopics"
        label="Forbidden topics"
        hint="Topics the AI should avoid. One per line, or comma-separated."
        errors={errors.forbiddenTopics}
      >
        <Textarea
          id="forbiddenTopics"
          value={state.forbiddenTopics}
          onChange={(event) => onChange({ forbiddenTopics: event.target.value })}
          placeholder={"Politics\nCompetitor names"}
        />
      </Field>
      <Field id="preferredCta" label="Preferred call to action" errors={errors.preferredCta}>
        <Input
          id="preferredCta"
          value={state.preferredCta}
          onChange={(event) => onChange({ preferredCta: event.target.value })}
          placeholder="Start your free trial"
        />
      </Field>
    </div>
  );
}

export function BrandPreferencesFields({ state, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-4">
      <Field id="preferredPlatforms" label="Preferred platforms" errors={errors.preferredPlatforms}>
        <PlatformPicker
          value={state.preferredPlatforms}
          onChange={(next) => onChange({ preferredPlatforms: next })}
        />
      </Field>
      <Field id="postingFrequency" label="Posting frequency" errors={errors.postingFrequency}>
        <select
          id="postingFrequency"
          value={state.postingFrequency}
          onChange={(event) => onChange({ postingFrequency: event.target.value })}
          className={cn(
            "flex h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          <option value="">Not set</option>
          {POSTING_FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="brandColors"
        label="Brand colors"
        hint="Up to three hex colors used in generated media."
        errors={errors.brandColors}
      >
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2].map((index) => {
            const current = state.brandColors[index] ?? "";
            return (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`Brand color ${index + 1}`}
                  value={/^#[0-9a-fA-F]{6}$/.test(current) ? current : "#2563eb"}
                  onChange={(event) => {
                    const next = [...state.brandColors];
                    next[index] = event.target.value;
                    onChange({ brandColors: next });
                  }}
                  className="size-9 cursor-pointer rounded-lg border border-input bg-transparent"
                />
                <Input
                  value={current}
                  onChange={(event) => {
                    const next = [...state.brandColors];
                    next[index] = event.target.value;
                    onChange({ brandColors: next });
                  }}
                  placeholder="#2563EB"
                  className="w-28"
                />
              </div>
            );
          })}
        </div>
      </Field>
      <Field
        id="videoStylePreference"
        label="Video style preference"
        errors={errors.videoStylePreference}
      >
        <Input
          id="videoStylePreference"
          value={state.videoStylePreference}
          onChange={(event) =>
            onChange({ videoStylePreference: event.target.value })
          }
          placeholder="Fast-paced, minimal, kinetic captions..."
        />
      </Field>
    </div>
  );
}
