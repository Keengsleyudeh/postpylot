import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Building2, Calendar, Link2, Send, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";

export const metadata: Metadata = {
  title: "Overview",
};

const QUICK_STATS = [
  { label: "Posts generated", value: "0", icon: Activity },
  { label: "Scheduled", value: "0", icon: Calendar },
  { label: "Published", value: "0", icon: Send },
];

const QUICK_LINKS = [
  { href: "/dashboard/brands", label: "Set up a brand", icon: Building2 },
  { href: "/dashboard/generate", label: "Generate content", icon: Sparkles },
  { href: "/dashboard/accounts", label: "Connect platforms", icon: Link2 },
];

export default async function DashboardPage() {
  const user = await getDashboardUser();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${user.displayName}.`}
        description="Your AI content engine on autopilot. Use the sidebar to navigate your workspace."
      />

      <Badge variant="secondary" className="w-fit">
        Phase 5 — Dashboard shell
      </Badge>

      <InstallPrompt />

      <section className="grid gap-4 sm:grid-cols-3">
        {QUICK_STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="outline"
              render={<Link href={link.href} />}
              nativeButton={false}
            >
              <link.icon aria-hidden />
              {link.label}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
