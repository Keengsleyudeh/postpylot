"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, getMotionVariants } from "@/lib/animations";

export function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <section className="landing-section pb-24" aria-labelledby="final-cta-heading">
      <div className="landing-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={variants}
          className="relative overflow-hidden rounded-2xl bg-postpylot-gradient p-px"
        >
          <div className="relative rounded-[15px] bg-card px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_50%)]"
              aria-hidden
            />
            <div className="relative space-y-6">
              <h2
                id="final-cta-heading"
                className="font-heading text-3xl font-bold sm:text-4xl"
              >
                Ready to put your content on autopilot?
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Join PostPylot and turn one idea into platform-ready content —
                generated, scheduled, published, and tracked automatically.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
