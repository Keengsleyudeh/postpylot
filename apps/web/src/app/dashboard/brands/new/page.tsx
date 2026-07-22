import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { BrandWizard } from "@/components/brands/brand-wizard";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New brand",
};

export default function NewBrandPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create a brand"
        description="Set up a brand profile so PostPylot can generate content in your voice."
      />
      <Card>
        <CardContent className="py-2">
          <BrandWizard />
        </CardContent>
      </Card>
    </div>
  );
}
