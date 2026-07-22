"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BrandBasicsFields,
  BrandPreferencesFields,
  BrandVoiceFields,
  EMPTY_BRAND_FORM,
  brandFormStateToValues,
  type BrandFormState,
} from "@/components/brands/brand-form-fields";
import { createBrand } from "@/lib/brands/actions";
import { brandStepSchemas } from "@/lib/brands/schemas";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Basics", description: "Name your brand and link its home." },
  { title: "Voice & audience", description: "Teach the AI how you sound." },
  { title: "Preferences", description: "Choose platforms, cadence, and style." },
] as const;

type Errors = Record<string, string[] | undefined>;

export function BrandWizard() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [state, setState] = useState<BrandFormState>(EMPTY_BRAND_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isLastStep = step === STEPS.length - 1;

  function patch(next: Partial<BrandFormState>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  function validateStep(): boolean {
    const values = brandFormStateToValues(state);
    const result = brandStepSchemas[step].safeParse(values);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setFormError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleSubmit() {
    if (!validateStep()) return;
    setFormError(null);

    startTransition(async () => {
      const result = await createBrand(brandFormStateToValues(state));
      if (!result.ok) {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }
      router.push("/dashboard/brands");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => {
          const isComplete = index < step;
          const isCurrent = index === step;
          return (
            <li key={item.title} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isComplete && "border-primary bg-primary/10 text-primary",
                  !isCurrent && !isComplete && "border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.title}
              </span>
              {index < STEPS.length - 1 ? (
                <div className="h-px flex-1 bg-border" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div>
        <h2 className="font-heading text-lg font-semibold">{STEPS[step].title}</h2>
        <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 ? (
            <BrandBasicsFields state={state} onChange={patch} errors={errors} />
          ) : null}
          {step === 1 ? (
            <BrandVoiceFields state={state} onChange={patch} errors={errors} />
          ) : null}
          {step === 2 ? (
            <BrandPreferencesFields state={state} onChange={patch} errors={errors} />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0 || isPending}
        >
          <ArrowLeft aria-hidden />
          Back
        </Button>
        {isLastStep ? (
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Check aria-hidden />
            )}
            Create brand
          </Button>
        ) : (
          <Button type="button" onClick={goNext} disabled={isPending}>
            Continue
            <ArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
