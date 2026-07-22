"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PostPylotLogo } from "@/components/brand/postpylot-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Platforms", href: "#platforms" },
  { label: "Automation", href: "#automation" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <nav
        className="landing-container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        <Link href="/" className="inline-flex items-center" aria-label="PostPylot home">
          <PostPylotLogo size="md" decorative />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button render={<Link href="/login" />} nativeButton={false}>
            Launch PostPylot
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <ul className="landing-container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <Button
              className="w-full"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Launch PostPylot
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
