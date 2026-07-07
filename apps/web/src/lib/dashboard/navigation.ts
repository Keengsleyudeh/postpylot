import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  Download,
  LayoutDashboard,
  Link2,
  Send,
  Settings,
  Shield,
  Sparkles,
  Video,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/brands", label: "Brands", icon: Building2 },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/generate", label: "Generate", icon: Sparkles },
  { href: "/dashboard/videos", label: "Videos", icon: Video },
  { href: "/dashboard/posts", label: "Posts", icon: Send },
  { href: "/dashboard/accounts", label: "Accounts", icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: true },
  { href: "/dashboard/settings/pwa", label: "PWA", icon: Download },
  { href: "/dashboard/settings/auth", label: "Auth", icon: Shield },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/brands": "Brands",
  "/dashboard/calendar": "Calendar",
  "/dashboard/generate": "Generate",
  "/dashboard/videos": "Videos",
  "/dashboard/posts": "Posts",
  "/dashboard/accounts": "Accounts",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/pwa": "PWA",
  "/dashboard/settings/auth": "Auth",
};

export function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "Dashboard";
}

export function isNavItemActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
