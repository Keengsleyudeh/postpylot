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
import { prisma } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getBrandCount } from "@/lib/brands/queries";

export const metadata: Metadata = {
  title: "Overview",
};

const QUICK_LINKS = [
  { href: "/dashboard/brands", label: "Set up a brand", icon: Building2 },
  { href: "/dashboard/generate", label: "Generate content", icon: Sparkles },
  { href: "/dashboard/accounts", label: "Connect platforms", icon: Link2 },
];

export default async function DashboardPage() {
  const user = await getDashboardUser();
  const [brandCount, postCount, scheduledCount, publishedCount, accountCount] =
    await Promise.all([
      getBrandCount(user.id),
      prisma.post.count({ where: { brand: { userId: user.id } } }),
      prisma.schedule.count({
        where: { brand: { userId: user.id }, status: "scheduled" },
      }),
      prisma.post.count({
        where: { brand: { userId: user.id }, status: "published" },
      }),
      prisma.platformAccount.count({
        where: { userId: user.id, status: "connected" },
      }),
    ]);

  const quickStats = [
    { label: "Brands", value: String(brandCount), icon: Building2 },
    { label: "Posts", value: String(postCount), icon: Activity },
    { label: "Scheduled", value: String(scheduledCount), icon: Calendar },
    { label: "Published", value: String(publishedCount), icon: Send },
    { label: "Connected", value: String(accountCount), icon: Link2 },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${user.displayName}.`}
        description="Your AI content engine on autopilot. Use the sidebar to navigate your workspace."
      />

      <Badge variant="secondary" className="w-fit">
        Generate, schedule &amp; publish
      </Badge>

      <InstallPrompt />

      {brandCount === 0 ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardDescription className="text-foreground">
                Set up your first brand
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                AI content generation needs a brand profile to match your voice
                and audience.
              </p>
            </div>
            <Button
              render={<Link href="/dashboard/brands/new" />}
              nativeButton={false}
            >
              <Building2 aria-hidden />
              Create brand
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {quickStats.map((stat) => (
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
