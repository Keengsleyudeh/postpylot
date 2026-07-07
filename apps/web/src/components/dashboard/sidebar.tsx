import Link from "next/link";

import { NavLink } from "@/components/dashboard/nav-link";
import {
  DASHBOARD_NAV,
  SETTINGS_NAV,
} from "@/lib/dashboard/navigation";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          className="font-heading text-lg font-bold tracking-tight"
        >
          <span className="text-postpylot-gradient">PostPylot</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
        {DASHBOARD_NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <nav
        className="border-t border-sidebar-border p-3"
        aria-label="Settings"
      >
        {SETTINGS_NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
