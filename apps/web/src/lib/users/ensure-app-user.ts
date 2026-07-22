import "server-only";

import { prisma } from "@postpylot/db";

import type { DashboardUser } from "@/lib/auth/get-dashboard-user";

// Mirrors the Supabase auth user into the Postgres `users` table so brands and
// other records always have a valid owner. Runs on every dashboard visit.
export async function ensureAppUser(user: DashboardUser): Promise<void> {
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
    },
    update: {
      email: user.email ?? null,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
    },
  });
}
