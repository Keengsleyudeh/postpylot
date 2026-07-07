"use client";

import { useState } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import type { DashboardUser } from "@/lib/auth/get-dashboard-user";

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpenChange={setMobileNavOpen}
        />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
