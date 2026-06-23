import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const colorSwatches = [
  { name: "Midnight Navy", hex: "#050B18", className: "bg-[#050B18]" },
  { name: "Deep Space Blue", hex: "#071A2F", className: "bg-[#071A2F]" },
  { name: "Electric Blue", hex: "#2563EB", className: "bg-[#2563EB]" },
  { name: "Cyan Glow", hex: "#22D3EE", className: "bg-[#22D3EE]" },
  { name: "Violet AI", hex: "#8B5CF6", className: "bg-[#8B5CF6]" },
  { name: "Success", hex: "#22C55E", className: "bg-success" },
  { name: "Warning", hex: "#F59E0B", className: "bg-warning" },
  { name: "Error", hex: "#EF4444", className: "bg-destructive" },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
          <header className="space-y-4 text-center">
            <Badge variant="secondary" className="mx-auto">
              Phase 1 Foundation
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-postpylot-gradient">PostPylot</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Your AI content engine on autopilot.
            </p>
            <p className="text-sm text-muted-foreground">
              Phase 1 foundation — landing page coming in Phase 2
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Component Preview</CardTitle>
              <CardDescription>
                shadcn/ui components with PostPylot theme tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Launch PostPylot</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Badge>Default</Badge>
              <Badge variant="secondary">AI Agent</Badge>
              <Badge variant="outline">Scheduled</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Color Palette</CardTitle>
              <CardDescription>PostPylot brand colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {colorSwatches.map((swatch) => (
                  <div key={swatch.hex} className="space-y-2">
                    <div
                      className={`h-12 rounded-lg border border-border ${swatch.className}`}
                    />
                    <div>
                      <p className="text-xs font-medium">{swatch.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {swatch.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Typography</CardTitle>
              <CardDescription>Font stack validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Space Grotesk — Headings
                </p>
                <p className="font-heading text-2xl font-semibold">
                  Generate. Schedule. Publish. Grow.
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Inter — Body
                </p>
                <p className="text-base">
                  Generate, schedule, publish, and track content across YouTube,
                  TikTok, LinkedIn, and Facebook without doing the repetitive
                  work yourself.
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  JetBrains Mono — Technical
                </p>
                <p className="font-mono text-sm text-accent">
                  topic → research → writer → publish → analytics
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-postpylot-gradient p-px">
            <div className="rounded-[11px] bg-card px-6 py-4 text-center">
              <p className="font-heading text-sm font-medium">
                Brand gradient utility ready for Phase 2 landing page
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
