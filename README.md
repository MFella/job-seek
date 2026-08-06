# job-seek

`job-seek` aggregates and lists job openings from various job boards and portals, tailored to user-defined preferences. It's a [Turborepo](https://turbo.build/) monorepo with four apps sharing one pnpm workspace.

## Apps

| App                                            | Stack                     | What it does                                                           |
| ----------------------------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| [`apps/job-seek-cli`](apps/job-seek-cli)         | Node, TypeScript           | The original interactive CLI — scrapes job boards, filters, generates tailored CVs. |
| [`apps/job-seek-web`](apps/job-seek-web)         | React, Vite, Tailwind      | Web frontend shell — job listing page + hosts the dashboard.           |
| [`apps/job-seek-dashboard`](apps/job-seek-dashboard) | Angular, Tailwind      | Filtering dashboard for gathered job offers, embedded into `job-seek-web` via iframe. |
| [`apps/job-seek-api`](apps/job-seek-api)         | NestJS, Prisma, PostgreSQL | Serves job offer data to both frontends; Prisma talks to Supabase Postgres. |

## Key Features

- **Job Aggregation**: Fetch job listings from multiple sources.
- **User Preferences**: Filter jobs based on role, location, salary, and more.
- **CLI Interface**: Interactive menu-driven prompts (`job-seek-cli`).
- **Web UI**: React shell + Angular filtering dashboard (`job-seek-web` / `job-seek-dashboard`), backed by a NestJS API.

## Getting Started

Requires [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) (pinned via `packageManager` in `package.json`).

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd job-seek
    ```

2.  **Install dependencies** (installs every app in the workspace):
    ```bash
    pnpm install
    ```

3.  **Configure environment variables** per app that needs them — copy each `.env.example` to `.env` and fill in values:
    - `apps/job-seek-web/.env.example` — API and dashboard URLs for the browser to hit.
    - `apps/job-seek-api/.env.example` — `DATABASE_URL` (Supabase Postgres connection string).
    - `apps/job-seek-cli` still needs its own `.env` with `GEMINI_API_KEY` (see `apps/job-seek-cli/CLAUDE.md`/root `CLAUDE.md`).

4.  **Run everything in dev mode**:
    ```bash
    pnpm dev
    ```
    This starts `job-seek-web` (`:5173`), `job-seek-dashboard` (`:4200`), and `job-seek-api` (`:3000`) together via Turborepo. `job-seek-cli` is interactive and not part of the long-running `dev` pipeline — run it directly (see below).

## Scripts

Run from the repo root; Turborepo fans these out to every app:

- `pnpm dev` — run all apps in dev mode
- `pnpm build` — build all apps
- `pnpm start` — run built output for all apps
- `pnpm lint` — lint all apps
- `pnpm test` — test all apps
- `pnpm format` — format the whole repo with Prettier

Target a single app with the filter shortcuts:

- `pnpm cli dev` — run the CLI (`tsx src/index.ts`)
- `pnpm web dev` / `pnpm dashboard dev` / `pnpm api dev` — run just that app's dev server
- `pnpm api test`, `pnpm web test`, `pnpm dashboard test` — run that app's test suite

See the root [`CLAUDE.md`](CLAUDE.md) for architecture notes on each app.
