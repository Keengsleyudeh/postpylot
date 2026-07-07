import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Track performance across YouTube, TikTok, LinkedIn, and Facebook."
      />
      <EmptyState
        icon={BarChart3}
        title="No analytics data"
        description="Performance metrics will sync from connected platforms after you publish content. Basic charts and reports arrive in a later phase."
        action={<PhaseStubAction label="View reports" phase="Phase 12" />}
      />
    </div>
  );
}
