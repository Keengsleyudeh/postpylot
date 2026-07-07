import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Generate",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Generate"
        description="Create posts, scripts, thumbnails, and captions with AI agents."
      />
      <EmptyState
        icon={Sparkles}
        title="AI generation workspace"
        description="Set up a brand first, then generate platform-ready content with Gemini-powered agents and quality scoring."
        action={<PhaseStubAction label="Start generating" phase="Phase 7" />}
      />
    </div>
  );
}
