"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BrandBasicsFields,
  BrandPreferencesFields,
  BrandVoiceFields,
  brandFormStateToValues,
  type BrandFormState,
} from "@/components/brands/brand-form-fields";
import { deleteBrand, updateBrand } from "@/lib/brands/actions";
import { brandFormSchema } from "@/lib/brands/schemas";

export type EditableBrand = {
  id: string;
  name: string;
  industry: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  audience: string | null;
  tone: string | null;
  offer: string | null;
  contentGoals: string[];
  forbiddenTopics: string[];
  preferredCta: string | null;
  preferredPlatforms: string[];
  postingFrequency: string | null;
  brandColors: string[];
  videoStylePreference: string | null;
};

type Errors = Record<string, string[] | undefined>;

function brandToFormState(brand: EditableBrand): BrandFormState {
  return {
    name: brand.name,
    industry: brand.industry ?? "",
    websiteUrl: brand.websiteUrl ?? "",
    logoUrl: brand.logoUrl ?? "",
    audience: brand.audience ?? "",
    tone: brand.tone ?? "",
    offer: brand.offer ?? "",
    contentGoals: brand.contentGoals.join("\n"),
    forbiddenTopics: brand.forbiddenTopics.join("\n"),
    preferredCta: brand.preferredCta ?? "",
    preferredPlatforms: brand.preferredPlatforms,
    postingFrequency: brand.postingFrequency ?? "",
    brandColors: brand.brandColors,
    videoStylePreference: brand.videoStylePreference ?? "",
  };
}

export function BrandEditForm({ brand }: { brand: EditableBrand }) {
  const router = useRouter();
  const [state, setState] = useState<BrandFormState>(brandToFormState(brand));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function patch(next: Partial<BrandFormState>) {
    setState((prev) => ({ ...prev, ...next }));
    setSavedAt(null);
  }

  function handleSave() {
    setFormError(null);
    const values = brandFormStateToValues(state);
    const parsed = brandFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});

    startSave(async () => {
      const result = await updateBrand(brand.id, values);
      if (!result.ok) {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${brand.name}"? This removes all of its content and cannot be undone.`
    );
    if (!confirmed) return;

    startDelete(async () => {
      const result = await deleteBrand(brand.id);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      router.push("/dashboard/brands");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold">Basics</h2>
        <BrandBasicsFields state={state} onChange={patch} errors={errors} />
      </section>
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold">Voice & audience</h2>
        <BrandVoiceFields state={state} onChange={patch} errors={errors} />
      </section>
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold">Preferences</h2>
        <BrandPreferencesFields state={state} onChange={patch} errors={errors} />
      </section>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
        >
          {isDeleting ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Trash2 aria-hidden />
          )}
          Delete brand
        </Button>
        <div className="flex items-center gap-3">
          {savedAt ? (
            <span className="text-sm text-success">Saved.</span>
          ) : null}
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Save aria-hidden />
            )}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
