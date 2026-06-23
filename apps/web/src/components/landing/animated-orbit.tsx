"use client";

import { motion } from "framer-motion";
import {
  FaFacebook,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { float, getMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

const platforms = [
  { icon: FaYoutube, label: "YouTube", color: "text-red-500" },
  { icon: FaTiktok, label: "TikTok", color: "text-foreground" },
  { icon: FaLinkedin, label: "LinkedIn", color: "text-blue-500" },
  { icon: FaFacebook, label: "Facebook", color: "text-blue-600" },
];

const positions = [
  "top-[8%] left-[12%]",
  "top-[12%] right-[10%]",
  "bottom-[18%] left-[8%]",
  "bottom-[12%] right-[14%]",
];

export function AnimatedOrbit({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const floatVariants = getMotionVariants(float, prefersReducedMotion);

  return (
    <div
      className={cn("relative mx-auto h-[280px] w-full max-w-md", className)}
      aria-hidden
    >
      <div className="glow-orb absolute inset-0 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_60px_rgba(37,99,235,0.4)]" />
      <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20" />
      <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/10" />

      {platforms.map((platform, index) => {
        const Icon = platform.icon;
        return (
          <motion.div
            key={platform.label}
            className={cn(
              "absolute flex size-12 items-center justify-center rounded-xl glass-card",
              positions[index]
            )}
            variants={floatVariants}
            animate={prefersReducedMotion ? undefined : "animate"}
            style={{
              animationDelay: prefersReducedMotion ? undefined : `${index * 0.5}s`,
            }}
          >
            <Icon className={cn("size-5", platform.color)} aria-hidden />
          </motion.div>
        );
      })}
    </div>
  );
}
