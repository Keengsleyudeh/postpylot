import type { Metadata } from "next";

import { getPlatformService } from "@postpylot/platforms";
import { PLATFORMS, platformLabel, type Platform } from "@postpylot/shared";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  AccountsPanel,
  type AccountView,
} from "@/components/accounts/accounts-panel";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getPlatformAccounts } from "@/lib/accounts/queries";

export const metadata: Metadata = {
  title: "Accounts",
};

// TikTok is still video-pipeline gated; YouTube is now connectable when its
// OAuth app is configured (Phase 9).
const VIDEO_FIRST: Platform[] = ["tiktok"];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await getDashboardUser();
  const [accounts, sp] = await Promise.all([
    getPlatformAccounts(user.id),
    searchParams,
  ]);

  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));

  const views: AccountView[] = PLATFORMS.map((platform) => {
    const account = byPlatform.get(platform);
    return {
      platform,
      label: platformLabel(platform),
      accountId: account?.id ?? null,
      accountName: account?.accountName ?? null,
      status: account?.status ?? null,
      configured: getPlatformService(platform).isConfigured(),
      videoFirst: VIDEO_FIRST.includes(platform),
    };
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Connect YouTube, TikTok, LinkedIn, and Facebook Pages for publishing. Platform OAuth is separate from app sign-in; tokens are encrypted."
      />

      {sp.connected ? (
        <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          Connected {platformLabel(sp.connected as Platform)} successfully.
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not connect: {sp.error}
        </p>
      ) : null}

      <AccountsPanel accounts={views} />
    </div>
  );
}
