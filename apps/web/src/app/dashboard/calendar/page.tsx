import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="View and manage your scheduled content across all platforms."
      />
      <EmptyState
        icon={Calendar}
        title="Nothing scheduled"
        description="Your content calendar will show upcoming posts and videos once you start scheduling. Automation rules arrive in a later phase."
        action={<PhaseStubAction label="Schedule content" phase="Phase 11" />}
      />
    </div>
  );
}
