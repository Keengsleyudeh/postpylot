"use client";

import { motion } from "framer-motion";
import { Hash, Sparkles, Zap } from "lucide-react";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, getMotionVariants } from "@/lib/animations";

export function TikTokAutomationSection() {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <section
      id="tiktok-automation"
      className="landing-section"
      aria-labelledby="tiktok-automation-heading"
    >
      <div className="landing-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="order-2 lg:order-1"
          >
            <div className="mx-auto w-full max-w-[280px]">
              <GlassCard className="aspect-[9/16] overflow-hidden p-0">
                <div className="flex h-full flex-col justify-between bg-gradient-to-b from-secondary/20 to-card p-5">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      <Zap className="size-3" aria-hidden />
                      Hook
                    </Badge>
                    <p className="font-heading text-lg font-bold leading-tight">
                      Stop posting manually.
                      <br />
                      Start growing on autopilot.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="rounded-lg bg-background/60 px-3 py-2 text-center text-sm font-semibold">
                      AI builds your TikTok in 60s
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {["#content", "#ai", "#growth", "#postpylot"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-accent"
                          >
                            <Hash className="size-2.5" aria-hidden />
                            {tag.replace("#", "")}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          <div className="order-1 space-y-6 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="TikTok automation"
              title="Short-form video, zero manual grind"
              description="Fast hooks, big captions, vertical 9:16 renders, and official TikTok publishing — built for creators who need consistency without burnout."
            />
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                15–60 second scripts optimized for retention
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                Burned-in captions and branded visuals
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                Repurpose YouTube topics into TikTok clips
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
