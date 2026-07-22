"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavItemActive } from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isNavItemActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active
            ? "text-primary"
            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
        )}
        aria-hidden
      />
      {label}
    </Link>
  );
}
