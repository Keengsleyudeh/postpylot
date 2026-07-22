# PostPylot — Development Constitution

The single north-star document for PostPylot. It states what we are building, the
priorities every decision serves, and the locked stack choices. When a detailed rule in
[`.cursor/rules/`](../.cursor/rules/) and this document ever disagree, this document and
the [ADRs](./adr/) win, and the rule should be corrected to match.

## What we are building

PostPylot is an AI-powered social media automation SaaS. One idea flows in; the platform
researches trends, writes content, generates images and videos, schedules, publishes to
multiple platforms, collects analytics, and improves future content. Users onboard once
and let the platform operate with minimal supervision.

**Tagline:** Your AI content engine on autopilot.

**MVP platforms:** YouTube, TikTok, LinkedIn, Facebook Pages.
**Architected to add later with minimal change:** Instagram, Threads, Pinterest, Reddit,
Medium, X (Twitter).

## Priorities (in order)

1. Production readiness and security
2. Low operating cost (open-source, self-host, free tiers first)
3. Scalability, maintainability, modularity
4. Performance and accessibility
5. Beautiful, premium UI
6. Developer experience

Never ship placeholder architecture. Build every module as if PostPylot will serve
millions of users — while keeping MVP infrastructure cost at **$0–15/month**.

## Locked stack decisions

These are the reconciled, canonical choices. They resolve conflicts between the original
constitution draft and the running codebase. Rationale lives in [ADRs](./adr/).

| Area | Decision | Notes |
|------|----------|-------|
| Framework | Next.js 16 (App Router), React 19, TypeScript | Do not downgrade to 15 |
| Package manager | npm workspaces | Not pnpm — see [ADR 003](./adr/003-package-manager-npm.md) |
| Styling / UI | Tailwind, shadcn/ui, Lucide | OLED black + neon lime `#C8FF00` |
| Animation (landing) | Motion (Framer Motion), GSAP, Lenis, typewriter-effect, react-countup | Cinematic |
| Animation (dashboard) | Subtle Motion only | No heavy 3D |
| Deferred UI libs | Lottie (empty states), Rive (onboarding mascots), Konva (thumbnail editor), command palette | Phase-gated, not MVP |
| Backend | Route Handlers (OAuth, webhooks, jobs) + Server Actions (UI mutations) | |
| Database | Supabase PostgreSQL + Prisma | RLS on |
| Auth | Supabase Auth, **Google SSO first** | GitHub/Microsoft/Facebook/Apple added only when needed |
| Storage | Supabase Storage | Generated media |
| Jobs / workers | **pg-boss** on the existing Postgres, separate worker process | Not Inngest — see [ADR 001](./adr/001-jobs-pg-boss.md) |
| AI (LLM) | Gemini primary, OpenAI fallback, Anthropic later | Free/cheap tier first |
| Images | Satori + @resvg/resvg-js + Sharp (template-based) | No paid image APIs in MVP |
| Video | Remotion + FFmpeg (worker only) | React video engine |
| Captions | Local Whisper (e.g. whisper.cpp) in worker | Free subtitles — see [ADR 002](./adr/002-tts-piper-kokoro.md) |
| Voice (TTS) | Piper (MVP) → Kokoro (quality upgrade) → ElevenLabs (optional premium) | Self-host first — see [ADR 002](./adr/002-tts-piper-kokoro.md) |
| Charts | recharts | |
| Deployment | Vercel (web) + separate worker host | |

**Rejected for MVP (kept as future notes, do not implement now):** Inngest as primary
job runner, pnpm migration, five SSO providers at once, Rive/Konva, ElevenLabs by
default, full organization/billing multi-tenancy.

## Architecture

Hybrid monorepo — packages by concern, plus domain folders inside the web app. Do not
rewrite the app into `src/features/*` mid-build. See
[ADR 004](./adr/004-architecture-hybrid-monorepo.md).

```text
postpylot/
  apps/web/          # Next.js App Router PWA (domain folders under lib/ and components/)
  apps/worker/       # Background jobs, rendering, publishing (future phase)
  packages/db/       # Prisma schema (exists)
  packages/ai/       # Gemini, OpenAI, prompts, safety (future)
  packages/platforms/# youtube, tiktok, linkedin, facebook services (future)
  packages/shared/   # types, constants, utils (future)
```

Business logic lives in `lib/`, `packages/`, or services — never in UI components.
Server components by default; client components only for interactivity.

## AI agents

Implemented as structured functions returning JSON in the MVP. Nine focused agents (we
fold "Short-Form / YouTube Script / Thumbnail" into Writer / Image / Video to avoid
sprawl):

| Agent | Role | MVP |
|-------|------|-----|
| Research | Trends and sources (Google Trends, Reddit, news, blogs, GitHub releases) | Stub, then real |
| Topic | Choose next topic, dedupe, use prior analytics | Yes |
| Writer | Posts, scripts, titles, descriptions, tags, SEO, hashtags | Yes |
| Image | Prompts + Satori template graphics, thumbnails, quote cards | Yes |
| Voice | Narration via Piper (then Kokoro), pacing | Yes (worker) |
| Video | Remotion compositions + Whisper captions + FFmpeg | Yes (worker) |
| Publishing | Per-platform publish, OAuth refresh, retry, status | Yes |
| Analytics | Views/likes/comments/CTR/watch time + recommendations | Yes (basic) |
| Quality Control | Score gate before auto-publish | Yes |

## Non-negotiables

1. Product name is **PostPylot** (never PostPilot).
2. PWA main app; SSO-first via Supabase (Google first).
3. App login is not platform publishing OAuth — connect each platform separately.
4. Official APIs only — no browser automation for publishing.
5. TypeScript everywhere; never `any`. Encrypt platform tokens; never expose secrets to
   the client.
6. Heavy video rendering runs in the worker, not the frontend.
7. Store generated media in Supabase Storage; Prisma + PostgreSQL for data.
8. Security: encrypt tokens, validate OAuth state, CSRF protection, rate limiting, RBAC,
   Supabase RLS, validate and sanitize every request.
9. Add loading, error, empty, and success states. Respect `prefers-reduced-motion`.
10. Personal/internal use first; structure for future SaaS (multi-brand, teams, billing).
11. No unmarked placeholder code — typed stubs with clear TODOs where APIs are untestable.

## Data model

Core tables today: `users`, `brands`, `platform_accounts`, `content_ideas`, `posts`,
`videos`, `schedules`, `analytics`, `agent_logs`, `automation_rules`, `notifications`,
`media_assets`. Every table has `id`, `createdAt`, `updatedAt`, indexes, and foreign
keys; soft delete where appropriate (brands, media — not auth users).

Roadmap tables (post-MVP): `templates` (reusable Remotion/Satori templates),
`organizations`, `subscriptions` (multi-tenant + billing). `workflows` map to the
existing `automation_rules`.

## Build order

| Phase | Deliverable |
|-------|-------------|
| 1 | Next.js + Tailwind + shadcn/ui + theme + env validation |
| 2 | Animated landing page (12 sections) |
| 3 | Supabase Auth, Google SSO, protected `/dashboard` |
| 4 | PWA manifest, icons, install prompt, offline fallback |
| 5 | Dashboard shell (all routes, empty states) |
| 6 | Prisma schema, migrations, brand onboarding |
| 7 | AI generation (Gemini, prompts, quality scoring) |
| 8 | Media (Satori/Sharp images, Remotion/FFmpeg video, Piper voice, Whisper captions) |
| 9 | Platform OAuth + encrypted tokens |
| 10 | Publishing + logs |
| 11 | pg-boss jobs, scheduling, automation rules |
| 12 | Basic analytics |
| 13+ | Templates, organizations, subscriptions, extra platforms, extra SSO |

## Testing and docs

Phase-gated, not blocking earlier phases: unit tests for business logic, integration
tests for agents/services, Playwright for end-to-end flows. Each substantial feature gets
a short README, flow notes, and API documentation.

## Cost envelope

MVP runs at **$0–15/month**: Supabase free tier, Vercel free tier, Gemini free/cheap
tier, Piper/Kokoro self-hosted TTS, template images, pg-boss on the existing Postgres.
Prefer open-source and self-host until quality genuinely forces a paid upgrade. See
[`.cursor/rules/postpylot-cost.mdc`](../.cursor/rules/postpylot-cost.mdc).

## Verify before completing a phase

```bash
npm run lint && npm run typecheck && npm run build
```
