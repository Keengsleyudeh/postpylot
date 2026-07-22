# PostPylot

**Your AI content engine on autopilot.**

PostPylot is an AI-powered social media automation platform that helps creators, businesses, and brands generate, schedule, publish, and track content across YouTube, TikTok, LinkedIn, and Facebook Pages.

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example apps/web/.env.local
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `npm run start` | Start production server |

## Project Structure

```text
postpylot/
  apps/web/          # Next.js PWA frontend
  packages/db/       # Prisma schema (exists)
  packages/          # ai, platforms, shared (added per phase)
  docs/              # CONSTITUTION.md + ADRs (north star)
  .cursor/rules/     # AI agent instructions
```

## Architecture & Decisions

- North star: [docs/CONSTITUTION.md](./docs/CONSTITUTION.md)
- Decision records: [docs/adr/](./docs/adr/) (jobs, TTS, package manager, architecture)

## Build Phases

See [AGENTS.md](./AGENTS.md) for the full build roadmap.
