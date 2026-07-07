import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — PostPylot",
};

const UPCOMING_CARDS = [
  {
    title: "Dashboard shell",
    description:
      "Sidebar, topbar, and all core routes land in Phase 5 of the build.",
    phase: "Phase 5",
  },
  {
    title: "Brand setup",
    description:
      "Define your brand voice, audience, and content pillars to power AI generation.",
    phase: "Phase 6",
  },
  {
    title: "Platform connections",
    description:
      "Connect YouTube, TikTok, LinkedIn, and Facebook Pages for publishing.",
    phase: "Phase 9",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "there";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-10 rounded-full ring-1 ring-foreground/10"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-postpylot-gradient text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium">{user.email ?? displayName}</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <section className="space-y-2">
        <Badge variant="secondary">Phase 3 — Auth complete</Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome to PostPylot, {displayName}.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          You&apos;re authenticated and this route is protected. The full
          dashboard shell, brand onboarding, and platform connections arrive
          in upcoming phases.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {UPCOMING_CARDS.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">
                {card.phase}
              </Badge>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
