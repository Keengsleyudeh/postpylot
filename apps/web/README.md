# @postpylot/web

The PostPylot Next.js 16 (App Router) PWA — landing page, auth, and dashboard.

Part of the PostPylot monorepo. Run everything from the repo root with npm workspaces; see
the root [README](../../README.md), [AGENTS.md](../../AGENTS.md), and the north-star
[docs/CONSTITUTION.md](../../docs/CONSTITUTION.md).

## Develop

From the repo root:

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind, shadcn/ui, Lucide
- Motion (Framer Motion), GSAP, Lenis for animation
- Supabase (Auth + Postgres via Prisma in `@postpylot/db`)
- Fonts: Syne (display), Plus Jakarta Sans (body), JetBrains Mono (technical)

Brand system (OLED black + neon lime `#C8FF00`), design rules, and animation guidance live
in [`.cursor/rules/postpylot-ui.mdc`](../../.cursor/rules/postpylot-ui.mdc). Do not
reintroduce create-next-app defaults (Geist, blue/purple, Inter/system fonts).

## Verify

```bash
npm run lint && npm run typecheck && npm run build
```
