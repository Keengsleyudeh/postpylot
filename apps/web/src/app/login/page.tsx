import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSsoButton } from "@/components/auth/google-sso-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in — PostPylot",
  description: "Sign in to your PostPylot command center.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next ?? "/dashboard");
  }

  return (
    <AuthCard>
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to generate, schedule, and publish your content.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          Something went wrong signing you in. Please try again.
        </p>
      ) : null}

      <GoogleSsoButton next={next ?? "/dashboard"} />

      <p className="text-center text-xs text-muted-foreground">
        Signing in only authenticates your PostPylot account. You&apos;ll
        connect YouTube, TikTok, LinkedIn, and Facebook separately from your
        dashboard.
      </p>
    </AuthCard>
  );
}
