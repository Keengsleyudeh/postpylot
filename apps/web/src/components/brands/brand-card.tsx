import Link from "next/link";
import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_OPTIONS } from "@/lib/brands/schemas";

const PLATFORM_LABELS = new Map<string, string>(
  PLATFORM_OPTIONS.map((option) => [option.value, option.label])
);

export type BrandCardData = {
  id: string;
  name: string;
  industry: string | null;
  tone: string | null;
  preferredPlatforms: string[];
  isDefault: boolean;
};

export function BrandCard({ brand }: { brand: BrandCardData }) {
  return (
    <Link
      href={`/dashboard/brands/${brand.id}`}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-shadow hover:ring-primary/40">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <CardTitle>{brand.name}</CardTitle>
          </div>
          {brand.isDefault ? <Badge variant="secondary">Default</Badge> : null}
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{brand.industry || "No industry set"}</p>
          {brand.preferredPlatforms.length ? (
            <div className="flex flex-wrap gap-1.5">
              {brand.preferredPlatforms.map((platform) => (
                <Badge key={platform} variant="outline">
                  {PLATFORM_LABELS.get(platform) ?? platform}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
