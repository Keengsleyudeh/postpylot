"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Layers,
  MessageSquareWarning,
  Repeat,
  Sparkles,
} from "lucide-react";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeUp,
  getMotionVariants,
  staggerContainer,
} from "@/lib/animations";

const problems = [
  {
    icon: Clock,
    title: "No time to create daily",
    description:
      "Content creation is repetitive and eats hours you could spend growing your business.",
  },
  {
    icon: Layers,
    title: "Fragmented across platforms",
    description:
      "Every platform wants different formats, tones, and posting schedules.",
  },
  {
    icon: Repeat,
    title: "Inconsistent publishing",
    description:
      "Manual posting makes it hard to stay visible when life gets busy.",
  },
  {
    icon: Sparkles,
    title: "Creative burnout",
    description:
      "Coming up with fresh ideas every week drains energy and momentum.",
  },
  {
    icon: BarChart3,
    title: "Scattered analytics",
    description:
      "Performance data lives in silos — no single view of what is working.",
  },
  {
    icon: MessageSquareWarning,
    title: "Expensive tools",
    description:
      "Most automation stacks cost too much for solo creators and small teams.",
  },
];

export function ProblemSection() {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = getMotionVariants(fadeUp, prefersReducedMotion);
  const containerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : staggerContainer;

  return (
    <section
      id="problem"
      className="landing-section"
      aria-labelledby="problem-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="The problem"
          title="Social media shouldn't feel like a second job"
          description="Creators, businesses, and brands struggle to stay consistent because content work is manual, fragmented, and never-ending."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <motion.div key={problem.title} variants={itemVariants}>
                <GlassCard className="h-full p-5 transition-transform hover:-translate-y-1">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-heading mb-2 text-lg font-semibold">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {problem.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
