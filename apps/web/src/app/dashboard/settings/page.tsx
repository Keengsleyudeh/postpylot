import type { Metadata } from "next";
import Link from "next/link";
import { Download, Shield } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

const SETTINGS_CARDS = [
  {
    href: "/dashboard/settings/pwa",
    title: "PWA",
    description: "Install PostPylot as an app and manage offline behavior.",
    icon: Download,
  },
  {
    href: "/dashboard/settings/auth",
    title: "Auth",
    description: "App sign-in via Google SSO. Platform publishing OAuth is separate.",
    icon: Shield,
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your PostPylot app preferences and account."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_CARDS.map((card) => (
          <Card key={card.href} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <card.icon className="mb-2 size-5 text-muted-foreground" aria-hidden />
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit"
                render={<Link href={card.href} />}
                nativeButton={false}
              >
                Open
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
