# PostPylot — Agent Guide

AI-powered social media automation SaaS. Generate, schedule, publish, and track content across **YouTube, TikTok, LinkedIn, and Facebook Pages**.

## Quick Reference

| Item | Value |
|------|-------|
| Product | PostPylot |
| Tagline | Your AI content engine on autopilot |
| First milestone | Landing + SSO + PWA + Dashboard shell + Brand setup |
| Auth | Supabase (Google SSO first) |
| AI | Gemini primary, OpenAI fallback |
| Worker | Separate process for video render + publish jobs |

## Cursor Rules

Detailed instructions live in `.cursor/rules/`:

| Rule | Scope |
|------|-------|
| `postpylot-core.mdc` | Product identity, non-negotiables, build order, MVP DoD |
| `postpylot-architecture.mdc` | Monorepo layout, stack, env vars, dev behavior |
| `postpylot-ui.mdc` | Design system, landing sections, animation rules |
| `postpylot-data.mdc` | Prisma schema, brand profile, quality gates |
| `postpylot-integrations.mdc` | Platform OAuth, publishing, jobs, automation |

## Build Sequence

1. Foundation (Next.js, Tailwind, shadcn/ui, theme)
2. Landing page (animated, 12 sections)
3. Auth (Supabase + Google SSO + protected dashboard)
4. PWA (manifest, icons, offline, install prompt)
5. Dashboard shell (all routes + empty states)
6. Database + brand onboarding
7. AI content generation
8. Media generation (images + videos in worker)
9. Platform connections
10. Publishing
11. Automation (pg-boss)
12. Analytics

## Critical Constraints

- **PostPylot** spelling (not PostPilot)
- No X/Twitter in MVP
- Official APIs only — no browser automation
- Video rendering in worker, not frontend
- Encrypt platform tokens; secrets server-only
- App SSO ≠ platform publishing OAuth

## Verify Before Completing a Phase

```bash
npm run lint && npm run typecheck && npm run build
```
