import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "PWA",
};

export default function PwaSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="PWA"
        description="Install PostPylot on your device for quick access and offline fallback."
      />

      <InstallPrompt />

      <Card>
        <CardHeader>
          <CardTitle>Progressive Web App</CardTitle>
          <CardDescription>
            PostPylot runs as a PWA with a standalone display mode, branded
            icons, and an offline fallback page when navigation fails without
            a connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Start URL:</strong> /dashboard
          </p>
          <p>
            <strong className="text-foreground">Offline:</strong> Cached
            fallback page when the network is unavailable.
          </p>
          <p>
            <strong className="text-foreground">Install:</strong> Use the
            prompt above or your browser&apos;s &quot;Install app&quot; option
            when available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
