import Link from "next/link";

import { PostPylotLogo } from "@/components/brand/postpylot-logo";
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
          className="inline-flex items-center"
          aria-label="PostPylot dashboard"
        >
          <PostPylotLogo size="md" decorative />
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
