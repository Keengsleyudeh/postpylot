import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type DashboardUser = {
  id: string;
  email: string | undefined;
  displayName: string;
  avatarUrl: string | undefined;
};

export async function getDashboardUser(): Promise<DashboardUser> {
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

  return {
    id: user.id,
    email: user.email,
    displayName,
    avatarUrl: user.user_metadata?.avatar_url as string | undefined,
  };
}
