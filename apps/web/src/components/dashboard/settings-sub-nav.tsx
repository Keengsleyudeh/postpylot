"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SETTINGS_NAV, isNavItemActive } from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

export function SettingsSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-border pb-4"
      aria-label="Settings sections"
    >
      {SETTINGS_NAV.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
