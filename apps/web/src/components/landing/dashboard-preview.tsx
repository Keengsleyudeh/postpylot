"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Activity, Calendar, Send, Video } from "lucide-react";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeUp,
  getMotionVariants,
  staggerContainer,
} from "@/lib/animations";

const stats = [
  {
    label: "Posts generated",
    value: 248,
    suffix: "+",
    icon: Activity,
  },
  {
    label: "Videos rendered",
    value: 64,
    suffix: "",
    icon: Video,
  },
  {
    label: "Scheduled this week",
    value: 18,
    suffix: "",
    icon: Calendar,
  },
  {
    label: "Published",
    value: 192,
    suffix: "+",
    icon: Send,
  },
];

export function DashboardPreview() {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = getMotionVariants(fadeUp, prefersReducedMotion);
  const containerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : staggerContainer;

  return (
    <section
      id="dashboard-preview"
      className="landing-section"
      aria-labelledby="dashboard-preview-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="Command center"
          title="Your content cockpit, at a glance"
          description="The PostPylot dashboard keeps generation, scheduling, publishing, and analytics in one calm, productive workspace."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          <GlassCard className="overflow-hidden p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="font-mono text-xs text-accent">dashboard preview</p>
                <h3 className="font-heading text-xl font-semibold">
                  Automation Status
                </h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <span className="size-2 rounded-full bg-success" />
                Active
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    className="rounded-xl border border-white/5 bg-muted/40 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Icon className="size-4 text-primary" aria-hidden />
                    </div>
                    <p className="font-heading text-3xl font-bold">
                      {prefersReducedMotion ? (
                        <>
                          {stat.value}
                          {stat.suffix}
                        </>
                      ) : (
                        <CountUp
                          end={stat.value}
                          suffix={stat.suffix}
                          duration={2}
                          enableScrollSpy
                          scrollSpyOnce
                        />
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {[
                "LinkedIn post — Monday 9:00 AM",
                "TikTok video — Wednesday 6:00 PM",
                "YouTube upload — Friday 12:00 PM",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/5 bg-background/40 px-4 py-3 text-sm"
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    upcoming
                  </p>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
