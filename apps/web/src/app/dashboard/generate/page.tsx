import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { hasLlmProvider } from "@postpylot/ai";
import { prisma, type Platform } from "@postpylot/db";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { GenerateWorkspace } from "@/components/generate/generate-workspace";
import { Button } from "@/components/ui/button";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { ensureAppUser } from "@/lib/users/ensure-app-user";

export const metadata: Metadata = {
  title: "Generate",
};

export default async function GeneratePage() {
  const user = await getDashboardUser();
  await ensureAppUser(user);

  const brands = await prisma.brand.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, preferredPlatforms: true },
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Generate"
        description="Create platform-ready posts with Gemini-powered agents and quality scoring."
      />

      {brands.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Set up a brand first"
          description="AI generation needs a brand profile to match your voice and audience."
          action={
            <Button render={<Link href="/dashboard/brands/new" />} nativeButton={false}>
              Create brand
            </Button>
          }
        />
      ) : (
        <GenerateWorkspace
          brands={brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
            preferredPlatforms: brand.preferredPlatforms as Platform[],
          }))}
          llmConfigured={hasLlmProvider()}
        />
      )}
    </div>
  );
}
