import type { Metadata } from "next";
import { Video } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Videos",
};

export default function VideosPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Videos"
        description="Manage YouTube and TikTok video projects rendered in the background worker."
      />
      <EmptyState
        icon={Video}
        title="No video projects"
        description="Video rendering runs in a separate worker using Remotion and FFmpeg. Projects will appear here once media generation is enabled."
        action={<PhaseStubAction label="Create video" phase="Phase 8" />}
      />
    </div>
  );
}
