"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Typewriter from "typewriter-effect";

import { GlassCard } from "@/components/landing/glass-card";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, float, getMotionVariants } from "@/lib/animations";

function DashboardMockup() {
  const prefersReducedMotion = useReducedMotion();
  const floatVariants = getMotionVariants(float, prefersReducedMotion);

  return (
    <motion.div
      variants={floatVariants}
      animate={prefersReducedMotion ? undefined : "animate"}
      className="w-full max-w-lg"
    >
      <GlassCard className="overflow-hidden p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-destructive/80" />
          <div className="size-2.5 rounded-full bg-warning/80" />
          <div className="size-2.5 rounded-full bg-success/80" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            postpylot — command center
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Posts generated", value: "128" },
            { label: "Scheduled", value: "24" },
            { label: "Published", value: "96" },
            { label: "Platforms", value: "4" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/5 bg-muted/50 p-3"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-heading text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 w-3/4 rounded-full bg-postpylot-gradient" />
          </div>
          <p className="font-mono text-xs text-accent">
            automation active — next publish in 2h
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <section className="landing-section overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 blur-3xl" />
      </div>

      <div className="landing-container relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          className="space-y-6 text-center lg:text-left"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            AI content autopilot
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your AI content engine on{" "}
            <span className="text-postpylot-gradient">autopilot</span>.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
            Generate, schedule, publish, and track content across{" "}
            {prefersReducedMotion ? (
              <span className="text-foreground">YouTube, TikTok, LinkedIn, and Facebook</span>
            ) : (
              <Typewriter
                options={{
                  strings: [
                    "YouTube",
                    "TikTok",
                    "LinkedIn",
                    "Facebook Pages",
                  ],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 50,
                  delay: 60,
                }}
              />
            )}{" "}
            without doing the repetitive work yourself.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Launch PostPylot
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href="#dashboard-preview" />}
              nativeButton={false}
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ delay: 0.15 }}
          className="flex min-h-[320px] flex-col items-center justify-center gap-6"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
