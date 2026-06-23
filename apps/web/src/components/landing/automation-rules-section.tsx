"use client";

import { motion } from "framer-motion";
import { Calendar, Pause, RefreshCw, Shield } from "lucide-react";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeUp,
  getMotionVariants,
  staggerContainer,
} from "@/lib/animations";

const rules = [
  {
    icon: Calendar,
    title: "Weekly LinkedIn post",
    schedule: "Every Monday at 9:00 AM",
    status: "Active",
  },
  {
    icon: RefreshCw,
    title: "YouTube video every Friday",
    schedule: "Script → render → upload",
    status: "Active",
  },
  {
    icon: Calendar,
    title: "TikTok short every Wednesday",
    schedule: "Vertical video + hashtags",
    status: "Active",
  },
  {
    icon: Shield,
    title: "Pause on low quality score",
    schedule: "Auto-publish only when safe",
    status: "Guardrail",
  },
  {
    icon: Pause,
    title: "Pause if account disconnects",
    schedule: "Protects failed publishes",
    status: "Guardrail",
  },
  {
    icon: RefreshCw,
    title: "Repurpose YouTube → TikTok",
    schedule: "One topic, two formats",
    status: "Active",
  },
];

export function AutomationRulesSection() {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = getMotionVariants(fadeUp, prefersReducedMotion);
  const containerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : staggerContainer;

  return (
    <section
      id="automation"
      className="landing-section"
      aria-labelledby="automation-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="Automation rules"
          title="Set it once. Let PostPylot run."
          description="Define weekly schedules, repurposing flows, and safety guardrails — then let the autopilot handle the rest."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <motion.div key={rule.title} variants={itemVariants}>
                <GlassCard className="h-full p-5 transition-transform hover:-translate-y-1">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="rounded-lg bg-secondary/10 p-2.5 text-secondary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <Badge
                      variant={
                        rule.status === "Guardrail" ? "outline" : "secondary"
                      }
                    >
                      {rule.status}
                    </Badge>
                  </div>
                  <h3 className="font-heading mb-1 font-semibold">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {rule.schedule}
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
