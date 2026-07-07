import type { Metadata } from "next";
import { Send } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhaseStubAction } from "@/components/dashboard/phase-stub-action";

export const metadata: Metadata = {
  title: "Posts",
};

export default function PostsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Posts"
        description="Review drafts, scheduled posts, and published content across your platforms."
      />
      <EmptyState
        icon={Send}
        title="No posts yet"
        description="Generated and scheduled posts will appear here with status tracking from draft through published."
        action={<PhaseStubAction label="Create post" phase="Phase 10" />}
      />
    </div>
  );
}
