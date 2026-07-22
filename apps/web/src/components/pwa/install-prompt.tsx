"use client";

import { Download, X } from "lucide-react";
import { useState } from "react";

import { PostPylotLogo } from "@/components/brand/postpylot-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPrompt() {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!canInstall) return null;

  async function handleInstall() {
    setIsInstalling(true);
    try {
      await promptInstall();
    } finally {
      setIsInstalling(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          <X aria-hidden />
        </Button>
        <div className="mb-2">
          <PostPylotLogo variant="mark" size="lg" decorative />
        </div>
        <CardTitle className="pr-8">Install PostPylot</CardTitle>
        <CardDescription>
          Add PostPylot to your home screen for quick access to your content
          engine — works like a native app.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={handleInstall} disabled={isInstalling}>
          <Download aria-hidden />
          {isInstalling ? "Installing…" : "Install app"}
        </Button>
        <Button type="button" variant="outline" onClick={dismiss}>
          Not now
        </Button>
      </CardContent>
    </Card>
  );
}
