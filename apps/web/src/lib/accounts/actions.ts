"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";

export type AccountActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function disconnectAccountAction(
  accountId: string
): Promise<AccountActionResult> {
  const user = await getDashboardUser();

  const account = await prisma.platformAccount.findFirst({
    where: { id: accountId, userId: user.id },
    select: { id: true },
  });
  if (!account) {
    return { ok: false, error: "Account not found." };
  }

  // Clear encrypted tokens and mark disconnected rather than deleting, so post
  // history keeps a reference to what it was published with.
  await prisma.platformAccount.update({
    where: { id: account.id },
    data: {
      status: "disconnected",
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");

  return { ok: true };
}
