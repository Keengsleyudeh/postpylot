import type { Metadata } from "next";

import { LogoutButton } from "@/components/auth/logout-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Auth",
};

export default async function AuthSettingsPage() {
  const user = await getDashboardUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auth"
        description="App authentication via Supabase Google SSO."
      />

      <Card>
        <CardHeader>
          <CardTitle>Signed in</CardTitle>
          <CardDescription>
            This is your PostPylot app account. It is separate from YouTube,
            TikTok, LinkedIn, and Facebook publishing connections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="size-12 rounded-full ring-1 ring-border"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Provider: Google SSO via Supabase. Platform publishing OAuth will
            be configured separately in Accounts (Phase 9).
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
