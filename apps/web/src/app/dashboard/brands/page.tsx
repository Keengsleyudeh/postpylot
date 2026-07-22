import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { BrandCard } from "@/components/brands/brand-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getBrandsForUser } from "@/lib/brands/queries";

export const metadata: Metadata = {
  title: "Brands",
};

export default async function BrandsPage() {
  const user = await getDashboardUser();
  const brands = await getBrandsForUser(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Brands"
          description="Define brand voice, audience, and content pillars to power AI generation."
        />
        {brands.length ? (
          <Button render={<Link href="/dashboard/brands/new" />} nativeButton={false}>
            <Plus aria-hidden />
            Create brand
          </Button>
        ) : null}
      </div>

      {brands.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={{
                id: brand.id,
                name: brand.name,
                industry: brand.industry,
                tone: brand.tone,
                preferredPlatforms: brand.preferredPlatforms,
                isDefault: brand.isDefault,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No brands yet"
          description="Create your first brand profile to unlock AI content generation tailored to your voice and audience."
          action={
            <Button render={<Link href="/dashboard/brands/new" />} nativeButton={false}>
              <Plus aria-hidden />
              Create brand
            </Button>
          }
        />
      )}
    </div>
  );
}
