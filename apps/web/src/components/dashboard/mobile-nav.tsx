"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { NavLink } from "@/components/dashboard/nav-link";
import {
  DASHBOARD_NAV,
  SETTINGS_NAV,
} from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-dashboard-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onOpenChange(false)}
        />
        <nav
          id="mobile-dashboard-nav"
          className={cn(
            "absolute top-0 left-0 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Mobile navigation"
        >
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link
              href="/dashboard"
              className="font-heading text-lg font-bold tracking-tight"
              onClick={() => onOpenChange(false)}
            >
              <span className="text-postpylot-gradient">PostPylot</span>
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-sidebar-accent"
              aria-label="Close menu"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {DASHBOARD_NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </div>

          <div className="border-t border-sidebar-border p-3">
            {SETTINGS_NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
