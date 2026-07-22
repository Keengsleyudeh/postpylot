# ADR 001 — Background jobs: pg-boss, not Inngest

Status: Accepted

## Context

PostPylot needs a job runner for publishing, analytics collection, retries, AI
generation, rendering, video creation, email, and cleanup. The original constitution
draft specified Inngest. The running codebase and rules already assume pg-boss on the
Supabase Postgres instance, with GitHub Actions as an optional early cron trigger.

## Decision

Use **pg-boss** as the primary job queue and scheduler, running in a separate worker
process against the existing Supabase PostgreSQL database.

- No cron in the Next.js app runtime. pg-boss owns schedules.
- GitHub Actions may act only as an early external trigger if ever needed before the
  worker is deployed.
- Inngest stays a documented future option for SaaS-scale fan-out, not an MVP dependency.

## Rationale

- **Cost:** $0 — reuses the Postgres we already pay nothing for on the Supabase free
  tier. No separate managed-queue billing and no free-tier event cliff.
- **Simplicity:** One database, transactional job state alongside app data, easy local
  dev.
- **Portability:** Not locked to a vendor's hosted event platform.

## Consequences

- We operate a long-running worker process (a small always-on host) rather than relying on
  a serverless event platform.
- If event volume or multi-tenant fan-out outgrows Postgres-backed queuing, revisit with
  an ADR proposing Inngest or a dedicated broker.
