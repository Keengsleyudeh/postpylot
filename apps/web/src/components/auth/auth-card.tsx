import Link from "next/link";

import { PostPylotLogo } from "@/components/brand/postpylot-logo";
import { GlassCard } from "@/components/landing/glass-card";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        <Link
          href="/"
          className="flex justify-center"
          aria-label="PostPylot home"
        >
          <PostPylotLogo size="lg" decorative />
        </Link>

        <GlassCard className="space-y-6 p-8">{children}</GlassCard>
      </div>
    </div>
  );
}
