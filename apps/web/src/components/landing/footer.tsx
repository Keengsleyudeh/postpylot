import Link from "next/link";

import { PostPylotLogo } from "@/components/brand/postpylot-logo";

const footerLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Platforms", href: "#platforms" },
  { label: "Automation", href: "#automation" },
  { label: "Pricing", href: "#pricing" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/80">
      <div className="landing-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <PostPylotLogo size="md" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Your AI content engine on autopilot. Generate, schedule, publish,
              and track content across YouTube, TikTok, LinkedIn, and Facebook.
            </p>
          </div>

          <div>
            <p className="mb-3 font-heading text-sm font-semibold">Navigate</p>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
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
          </div>

          <div>
            <p className="mb-3 font-heading text-sm font-semibold">Product</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Launch PostPylot
                </Link>
              </li>
              <li>
                <a
                  href="#dashboard-preview"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard Preview
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PostPylot. A Karixtechnologies product.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Create. Schedule. Publish. Grow.
          </p>
        </div>
      </div>
    </footer>
  );
}
