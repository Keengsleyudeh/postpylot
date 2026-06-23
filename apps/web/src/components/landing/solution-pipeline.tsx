"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import {
  BarChart3,
  Calendar,
  FileText,
  Image,
  Lightbulb,
  Search,
  Send,
  Video,
} from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  { id: "topic", label: "Topic", icon: Lightbulb },
  { id: "research", label: "Research", icon: Search },
  { id: "writer", label: "Content Writer", icon: FileText },
  { id: "image", label: "Image / Thumbnail", icon: Image },
  { id: "video", label: "Video Generator", icon: Video },
  { id: "scheduler", label: "Scheduler", icon: Calendar },
  { id: "publisher", label: "Publisher", icon: Send },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function SolutionPipeline() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current || !stepsRef.current) {
        return;
      }

      const stepElements = gsap.utils.toArray<HTMLElement>(
        "[data-pipeline-step]"
      );

      stepElements.forEach((step, index) => {
        gsap.fromTo(
          step,
          { opacity: 0.35, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top ${80 - index * 5}%`,
              end: `bottom ${20 + index * 5}%`,
              scrub: 0.5,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      className="landing-section"
      aria-labelledby="pipeline-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="The solution"
          title="One idea becomes a full content pipeline"
          description="PostPylot turns a single topic into platform-ready posts, visuals, videos, and published content — automatically."
        />

        <div ref={stepsRef} className="relative">
          <div
            className="absolute top-1/2 right-0 left-0 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent lg:block"
            aria-hidden
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = prefersReducedMotion;

              return (
                <div
                  key={step.id}
                  data-pipeline-step
                  className={cn(
                    "relative rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm transition-colors",
                    isActive ? "opacity-100" : "opacity-40"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-4 text-primary" aria-hidden />
                  </div>
                  <p className="font-heading text-sm font-semibold">
                    {step.label}
                  </p>
                  {index < steps.length - 1 ? (
                    <span
                      className="absolute -right-2 top-1/2 hidden -translate-y-1/2 font-mono text-muted-foreground lg:inline"
                      aria-hidden
                    >
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
