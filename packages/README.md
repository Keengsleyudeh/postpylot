# packages/

Shared packages for the PostPylot monorepo (consumed by both `apps/web` and the future
`apps/worker`).

- `db` — Prisma schema and client (**exists**, Phase 6)
- `ai` — Gemini/OpenAI integration, prompts, safety (future, Phase 7)
- `platforms` — YouTube, TikTok, LinkedIn, Facebook services (future, Phase 9)
- `shared` — common types, constants, utilities (future)

See [../docs/adr/004-architecture-hybrid-monorepo.md](../docs/adr/004-architecture-hybrid-monorepo.md)
for how packages relate to the web app's domain folders.
