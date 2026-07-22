"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeUp, getMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const variants = getMotionVariants(fadeUp, prefersReducedMotion);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Icon className="size-6 text-primary" aria-hidden />
      </div>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
