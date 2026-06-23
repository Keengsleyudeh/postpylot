"use client";

import dynamic from "next/dynamic";

import { AutomationRulesSection } from "@/components/landing/automation-rules-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";
import { PlatformCloud } from "@/components/landing/platform-cloud";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { TikTokAutomationSection } from "@/components/landing/tiktok-automation-section";
import { VideoAutomationSection } from "@/components/landing/video-automation-section";

const AnimatedOrbit = dynamic(
  () =>
    import("@/components/landing/animated-orbit").then((mod) => mod.AnimatedOrbit),
  { ssr: false, loading: () => <div className="h-[280px]" aria-hidden /> }
);

const SolutionPipeline = dynamic(
  () =>
    import("@/components/landing/solution-pipeline").then(
      (mod) => mod.SolutionPipeline
    ),
  { ssr: false, loading: () => <div className="min-h-[320px]" aria-hidden /> }
);

export function LandingPage() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main>
        <HeroSection />
        <div className="landing-container -mt-8 mb-8">
          <AnimatedOrbit />
        </div>
        <ProblemSection />
        <SolutionPipeline />
        <PlatformCloud />
        <VideoAutomationSection />
        <TikTokAutomationSection />
        <DashboardPreview />
        <AutomationRulesSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
