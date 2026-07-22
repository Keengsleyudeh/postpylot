# ADR 004 — Hybrid monorepo, not `src/features/*`

Status: Accepted

## Context

The constitution draft proposed a feature-based layout (`src/features/auth`,
`src/features/youtube`, ...). The codebase is a monorepo with `packages/*` for shared
concerns and, inside `apps/web`, domain folders split by layer (`lib/brands`,
`components/brands`, etc.).

## Decision

Use a **hybrid monorepo**:

- **Packages by concern:** `packages/db`, `packages/ai`, `packages/platforms`,
  `packages/shared` (created as their phases arrive).
- **Web app domain folders:** keep domain-oriented folders under `apps/web/src/lib/` and
  `apps/web/src/components/` (e.g. `lib/brands` + `components/brands`).

Do not rewrite the web app into `src/features/*` mid-build.

## Rationale

- Cross-cutting logic (AI, platform services, DB) belongs in shared packages so both the
  web app and the worker can consume it — a flat `features/` folder in the app cannot.
- The current layer-plus-domain structure already works and colocates related code well
  enough. A mid-build restructure is high risk, low reward.

## Consequences

- New domain logic goes into the right package (worker-shared) or the app's domain folder
  (web-only), never into UI components.
- Evolve toward clearer domain boundaries incrementally; if a full `features/` model ever
  becomes worthwhile, propose it in a new ADR.
