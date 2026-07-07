import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";

export const metadata: Metadata = {
  title: {
    template: "%s — PostPylot",
    default: "Dashboard — PostPylot",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
