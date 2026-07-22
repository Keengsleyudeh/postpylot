import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { BrandEditForm, type EditableBrand } from "@/components/brands/brand-edit-form";
import { Button } from "@/components/ui/button";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getBrandById } from "@/lib/brands/queries";

export const metadata: Metadata = {
  title: "Edit brand",
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getDashboardUser();
  const brand = await getBrandById(user.id, id);

  if (!brand) {
    notFound();
  }

  const editable: EditableBrand = {
    id: brand.id,
    name: brand.name,
    industry: brand.industry,
    websiteUrl: brand.websiteUrl,
    logoUrl: brand.logoUrl,
    audience: brand.audience,
    tone: brand.tone,
    offer: brand.offer,
    contentGoals: brand.contentGoals,
    forbiddenTopics: brand.forbiddenTopics,
    preferredCta: brand.preferredCta,
    preferredPlatforms: brand.preferredPlatforms,
    postingFrequency: brand.postingFrequency,
    brandColors: toStringArray(brand.brandColors),
    videoStylePreference: brand.videoStylePreference,
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href="/dashboard/brands" />}
        nativeButton={false}
      >
        <ArrowLeft aria-hidden />
        Back to brands
      </Button>
      <PageHeader
        title={brand.name}
        description="Update this brand's voice, audience, and content preferences."
      />
      <BrandEditForm brand={editable} />
    </div>
  );
}
