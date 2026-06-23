"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, getMotionVariants } from "@/lib/animations";

const features = [
  "AI content generation across 4 platforms",
  "YouTube + TikTok video automation",
  "Scheduling and publishing",
  "Brand profile and quality controls",
  "Basic analytics and publishing logs",
  "Low-cost infrastructure ($0–15/mo target)",
];

export function PricingSection() {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <section
      id="pricing"
      className="landing-section"
      aria-labelledby="pricing-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="Private beta"
          title="Built for creators first. Priced for growth."
          description="PostPylot starts as an internal automation tool and opens gradually. Join early access to shape the product."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={variants}
          className="mx-auto max-w-lg"
        >
          <GlassCard className="relative overflow-hidden p-8">
            <div
              className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />
            <div className="relative space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-accent" aria-hidden />
                <span className="font-mono text-sm text-accent">
                  Early access
                </span>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold">Private Beta</p>
                <p className="mt-1 text-muted-foreground">
                  Free during MVP validation
                </p>
              </div>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                size="lg"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Request Early Access
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
