"use client";

import { motion } from "framer-motion";
import { Mic, Play, Upload, Wand2 } from "lucide-react";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, getMotionVariants } from "@/lib/animations";

const flowSteps = [
  { icon: Wand2, label: "AI script generation" },
  { icon: Mic, label: "Voice-over with Piper TTS" },
  { icon: Play, label: "Template video render" },
  { icon: Upload, label: "YouTube upload + thumbnail" },
];

export function VideoAutomationSection() {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <section
      id="video-automation"
      className="landing-section"
      aria-labelledby="video-automation-heading"
    >
      <div className="landing-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="YouTube automation"
            title="Educational videos on autopilot"
            description="PostPylot generates scripts, voice-overs, branded slide videos, thumbnails, and uploads — 60 to 180 second videos without manual editing."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
          >
            <GlassCard className="aspect-video overflow-hidden p-0">
              <div className="flex h-full flex-col justify-between bg-gradient-to-br from-card to-muted p-6">
                <div className="space-y-2">
                  <p className="font-mono text-xs text-accent">youtube render</p>
                  <h3 className="font-heading text-xl font-semibold">
                    How AI automates your content workflow
                  </h3>
                </div>
                <div className="space-y-3">
                  {flowSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.label}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-background/40 px-3 py-2"
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {index + 1}
                        </span>
                        <Icon className="size-4 text-primary" aria-hidden />
                        <span className="text-sm">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
