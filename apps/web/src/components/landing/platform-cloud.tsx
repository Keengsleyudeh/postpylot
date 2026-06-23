"use client";

import { motion } from "framer-motion";
import {
  FaFacebook,
  FaLinkedin,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  fadeUp,
  getMotionVariants,
  staggerContainer,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "YouTube",
    icon: FaYoutube,
    color: "text-red-500",
    description: "Scripts, thumbnails, videos, and uploads",
    supported: true,
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    color: "text-foreground",
    description: "Short-form scripts, vertical video, and publishing",
    supported: true,
  },
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    color: "text-blue-500",
    description: "Professional posts and thought leadership",
    supported: true,
  },
  {
    name: "Facebook Pages",
    icon: FaFacebook,
    color: "text-blue-600",
    description: "Community posts and business updates",
    supported: true,
  },
  {
    name: "X / Twitter",
    icon: FaXTwitter,
    color: "text-muted-foreground",
    description: "Coming later",
    supported: false,
  },
];

export function PlatformCloud() {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = getMotionVariants(fadeUp, prefersReducedMotion);
  const containerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : staggerContainer;

  return (
    <section
      id="platforms"
      className="landing-section"
      aria-labelledby="platforms-heading"
    >
      <div className="landing-container space-y-12">
        <SectionHeading
          eyebrow="Platforms"
          title="Publish everywhere that matters"
          description="PostPylot MVP supports YouTube, TikTok, LinkedIn, and Facebook Pages — with more platforms on the roadmap."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.name}
                variants={itemVariants}
                className={cn(!platform.supported && "sm:col-span-2 lg:col-span-1")}
              >
                <GlassCard
                  className={cn(
                    "h-full p-5 transition-all hover:-translate-y-1 hover:border-primary/30",
                    !platform.supported && "opacity-70"
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn("size-6", platform.color)}
                        aria-hidden
                      />
                      <h3 className="font-heading font-semibold">
                        {platform.name}
                      </h3>
                    </div>
                    {!platform.supported ? (
                      <Badge variant="outline">Coming later</Badge>
                    ) : (
                      <Badge variant="secondary">MVP</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {platform.description}
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
