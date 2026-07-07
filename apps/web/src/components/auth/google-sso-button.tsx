"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export function GoogleSsoButton({ next = "/dashboard" }: { next?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", env.NEXT_PUBLIC_APP_URL);
    redirectTo.searchParams.set("next", next);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <FaGoogle aria-hidden />
        )}
        Continue with Google
      </Button>
      {error ? (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
