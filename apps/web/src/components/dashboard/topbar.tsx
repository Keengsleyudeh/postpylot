"use client";

import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DashboardUser } from "@/lib/auth/get-dashboard-user";
import { getPageTitle } from "@/lib/dashboard/navigation";

function UserAvatar({ user }: { user: DashboardUser }) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className="size-8 rounded-full ring-1 ring-border"
      />
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {user.displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export function Topbar({
  user,
  mobileNavOpen,
  onMobileNavOpenChange,
}: {
  user: DashboardUser;
  mobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav open={mobileNavOpen} onOpenChange={onMobileNavOpenChange} />
        <h2 className="font-heading text-base font-semibold sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <UserAvatar user={user} />
          <span className="max-w-[12rem] truncate text-sm text-muted-foreground">
            {user.email ?? user.displayName}
          </span>
        </div>
        <div className="sm:hidden">
          <UserAvatar user={user} />
        </div>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
