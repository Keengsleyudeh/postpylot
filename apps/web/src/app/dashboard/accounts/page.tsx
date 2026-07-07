import type { Metadata } from "next";
import { Link2 } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Accounts",
};

export default function AccountsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Connect YouTube, TikTok, LinkedIn, and Facebook Pages for publishing."
      />
      <EmptyState
        icon={Link2}
        title="No platforms connected"
        description="Platform publishing OAuth is separate from app sign-in. Connect each platform with encrypted token storage when publishing is enabled."
        action={
          <PhaseStubAction label="Connect platform" phase="Phase 9" />
        }
      />
    </div>
  );
}
