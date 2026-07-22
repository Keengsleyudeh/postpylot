"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Link2, Loader2, Unlink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { disconnectAccountAction } from "@/lib/accounts/actions";

export type AccountView = {
  platform: string;
  label: string;
  accountId: string | null;
  accountName: string | null;
  status: string | null;
  configured: boolean;
  videoFirst: boolean;
};

function statusBadge(status: string | null) {
  switch (status) {
    case "connected":
      return <Badge variant="secondary">Connected</Badge>;
    case "expired":
      return <Badge variant="destructive">Expired</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">Not connected</Badge>;
  }
}

function AccountRow({ account }: { account: AccountView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const connected = account.status === "connected";

  function handleDisconnect() {
    if (!account.accountId) return;
    setError(null);
    startTransition(async () => {
      const result = await disconnectAccountAction(account.accountId!);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {account.label}
          {statusBadge(account.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {account.videoFirst
            ? "Connects with the video pipeline (Phase 8)."
            : connected
              ? (account.accountName ?? "Connected account")
              : account.configured
                ? "Connect to publish posts to this platform."
                : "OAuth app not configured. Add its client keys to enable."}
        </p>

        {error ? (
          <span className="text-xs text-destructive">{error}</span>
        ) : null}

        {connected ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Unlink aria-hidden />
            )}
            Disconnect
          </Button>
        ) : (
          <Button
            variant={account.configured && !account.videoFirst ? "default" : "outline"}
            disabled={!account.configured || account.videoFirst}
            render={
              account.configured && !account.videoFirst ? (
                <a href={`/api/platforms/${account.platform}/connect`} />
              ) : undefined
            }
            nativeButton={!(account.configured && !account.videoFirst)}
          >
            {account.status === "disconnected" ? (
              <Check aria-hidden />
            ) : (
              <Link2 aria-hidden />
            )}
            {account.status === "disconnected" ? "Reconnect" : "Connect"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AccountsPanel({ accounts }: { accounts: AccountView[] }) {
  return (
    <div className="grid gap-3">
      {accounts.map((account) => (
        <AccountRow key={account.platform} account={account} />
      ))}
    </div>
  );
}
