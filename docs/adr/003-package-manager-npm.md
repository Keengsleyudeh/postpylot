# ADR 003 — Package manager: npm workspaces, not pnpm

Status: Accepted

## Context

The constitution draft specified pnpm. The repository already uses npm workspaces, has a
committed `package-lock.json`, and all scripts (`npm run dev`, `-w @postpylot/web`, etc.)
target npm.

## Decision

Stay on **npm workspaces**.

## Rationale

- Migrating to pnpm now is pure churn: rewriting lockfiles, scripts, CI, and docs for no
  functional gain at this stage.
- npm workspaces already give us the monorepo layout we need.
- The build, lint, and typecheck pipeline works today on npm.

## Consequences

- All docs and tooling reference npm. Do not introduce `pnpm-workspace.yaml` or
  `pnpm-lock.yaml`.
- If a concrete pnpm benefit (disk/install speed at larger scale) becomes material,
  revisit with a dedicated ADR and a one-shot migration.
