import type { Metadata } from "next";
import { Building2 } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Brands",
};

export default function BrandsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Brands"
        description="Define brand voice, audience, and content pillars to power AI generation."
      />
      <EmptyState
        icon={Building2}
        title="No brands yet"
        description="Create your first brand profile to unlock AI content generation tailored to your voice and audience."
        action={<PhaseStubAction label="Create brand" phase="Phase 6" />}
      />
    </div>
  );
}
