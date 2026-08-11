# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`job-seek` is a Turborepo monorepo that scrapes job openings from multiple job boards, filters them to user preferences, and can generate a tailored CV (via Gemini) as a PDF for a given job posting. Package manager is pnpm (pinned via `packageManager` in the root `package.json` — use `pnpm`, not `npm`/`yarn`). The workspace holds four apps:

- **`apps/job-seek-cli`** — the original Node/TypeScript CLI. Unchanged in behavior from before the monorepo split; just relocated.
- **`apps/job-seek-web`** — React (Vite) frontend shell. Owns top-level routing/layout and a "Jobs" page that calls `job-seek-api` directly.
- **`apps/job-seek-dashboard`** — Angular app for filtering/displaying gathered job offers. Served standalone (its own dev server / static build) and **embedded into `job-seek-web` via an `<iframe>`** (see `apps/job-seek-web/src/pages/dashboard-page.tsx`) — not a shared JS runtime, just an isolated page load. `VITE_DASHBOARD_URL` in `job-seek-web` controls the iframe `src`.
- **`apps/job-seek-api`** — NestJS backend exposing job data (`/job-offers` REST resource) backed by Prisma + Postgres (Supabase in production).

## Commands

Run from the repo root (Turborepo fans these out per-app; use `pnpm --filter <app>` or the `pnpm cli|web|dashboard|api` shortcuts below to target one app):

- `pnpm dev` — run all apps in dev mode (`turbo run dev`)
- `pnpm build` — build all apps (`turbo run build`)
- `pnpm start` — run built output for all apps (`turbo run start`)
- `pnpm lint` — lint all apps (`turbo run lint`)
- `pnpm test` — test all apps (`turbo run test`)
- `pnpm format` — `prettier --write .` across the whole repo
- `pnpm cli <script>` / `pnpm web <script>` / `pnpm dashboard <script>` / `pnpm api <script>` — run a script in just that app, e.g. `pnpm api test`

Per-app dev servers (default ports, all can run concurrently via `pnpm dev`):

- `job-seek-cli`: no server, `tsx src/index.ts` (interactive prompts)
- `job-seek-web`: Vite dev server on `:5173`
- `job-seek-dashboard`: Angular dev server on `:4200`
- `job-seek-api`: Nest on `:3000` (CORS enabled for the two frontends)

There is no test suite for `job-seek-cli` yet (`pnpm cli test` is a stub) — verify CLI changes by running `pnpm cli dev` rather than writing tests, unless asked to set up a framework first. The other three apps have real, working test setups (Vitest+RTL, Karma/Jasmine, Jest) — see per-app sections below.

## Architecture

### job-seek-cli

- **DI**: `tsyringe` throughout — classes are `@injectable()`, dependencies pulled via constructor `@inject(...)`. `reflect-metadata` is imported first in `src/index.ts` and must stay first.
- **Commands** (`src/commands/`): each command extends `BaseCommand<T>` (`src/commands/base-command.ts`) and implements `getKey()` and `execute()`. Commands return a stack of `NextCommandToExecute` to push, driving `app-manager`'s command-stack loop rather than direct function calls.
- **Job resolvers** (`src/resolvers/seek-job/*.resolver.ts`): each job board (e.g. `just-join-it`, `no-fluff-jobs`, `protocol-it`, `solid-jobs`) extends the abstract `SeekJobResolver<T>` (`src/resolvers/seek-job.resolver.ts`), implementing `getBaseUrl`, `getSeekJobsSuffix`, `getSeekJobDetailsSuffix`, `resolveMany`, `resolveOne`. Note: `src/resolvers/just-join-it.ts`, `src/resolvers/seek-job.ts`, and `src/resolvers/seek-job.resolver.ts` at the resolvers root are legacy/duplicate files from before the `seek-job/` subfolder — check which one is actually imported before editing either copy.
- **Services** (`src/services/`): `web-scrapper.service.ts` spawns a Python subprocess (`python3 -u ./scripts/nodriver_scrapper.py <url>`) for browser-driven scraping via `nodriver`. Python deps (`nodriver`, etc.) are installed globally, not via a `requirements.txt`/venv — `python3` and `nodriver` must simply be importable from PATH. `tailored-cv.service.ts` calls Gemini to tailor a CV from a master CV JSON + job description; `cv-pdf.service.ts` renders the result to PDF using a template from `src/templates/layouts/`.
- Imports use explicit `.ts`/`.js` extensions everywhere (required by `moduleResolution: NodeNext` + ESM) — don't drop them.
- TypeScript is `strict: true`; keep new code strict-clean.
- `.env` (gitignored, no committed `.env.example`) needs `GEMINI_API_KEY`; `GEMINI_MODEL` is optional (defaults to `gemini-2.5-flash`). Both are read in `src/services/tailored-cv.service.ts`.
- `preferences.enc` is an encrypted local preferences file (seek sources/techstack) via `@boringnode/encryption` — don't try to read/edit it as plain text.

### job-seek-web (React)

- Vite + React 19 + TypeScript, `react-router-dom` for routing, Tailwind v4 (via `@tailwindcss/vite`, no `tailwind.config` — v4 is CSS-first, see `src/index.css`).
- `src/layout/app-layout.tsx` is the shared shell (nav + outlet). `src/pages/jobs-page.tsx` calls the API directly; `src/pages/dashboard-page.tsx` iframes the Angular app.
- `src/lib/api-client.ts` is the thin fetch wrapper around `job-seek-api`; base URL from `VITE_API_URL` (see `.env.example`).
- Tests: Vitest + `@testing-library/react`, jsdom environment, setup file at `src/setup-tests.ts`. Run with `pnpm web test`.
- ESLint flat config mirrors `job-seek-cli`'s (same `@eslint/js` + `typescript-eslint` + Prettier base) plus `eslint-plugin-react-hooks`/`react-refresh`.

### job-seek-dashboard (Angular)

- Angular 19, standalone components, signals-based state (no NgRx/services beyond a thin `JobOffersService`).
- Pinned to Angular CLI/framework 19 because the local Node version (20.x) is below what Angular CLI 22+ requires (Node ≥22.22). Bump both together once Node is upgraded.
- `src/app/job-offers/` is the whole UI: a search input filters an in-memory signal (`computed()`) over job offers fetched once via `JobOffersService` (`src/app/services/job-offers.service.ts`, calls `${environment.apiUrl}/job-offers`).
- `src/environments/environment.ts` / `environment.development.ts` hold `apiUrl` (Angular's equivalent of `job-seek-web`'s `VITE_API_URL` — no `.env` mechanism here, it's build-time config).
- Tailwind v4 via PostCSS (`@tailwindcss/postcss`, configured in `.postcssrc.json`), imported in `src/styles.css`.
- Tests: default Karma + Jasmine (`pnpm dashboard test`, runs headless Chrome). Lint via `@angular-eslint` (`pnpm dashboard lint`).
- This app is meant to run standalone (`pnpm dashboard dev` on `:4200`) and be iframed by `job-seek-web` — don't add cross-app JS coupling; the only contract between them is the URL.

### job-seek-api (NestJS)

- Standard Nest module structure. `src/job-offers/` is a generated REST resource (controller + service + DTOs) backed by Prisma.
- **Prisma 7**: schema lives at `prisma/schema.prisma`, config at `prisma.config.ts` (Prisma 7 moved connection config out of the schema file — `datasource db` has no `url` anymore). The generated client goes to `generated/prisma/` (gitignored) with `moduleFormat = "cjs"` set explicitly in the generator block, because Nest/Jest here run as CommonJS and Prisma 7's default client output is ESM (`import.meta.url`) — don't remove that generator option or tests/builds will break.
- Connects via `@prisma/adapter-pg` (`src/prisma/prisma.service.ts`), not the legacy URL-only client — `PrismaService` builds a `PrismaPg` adapter from `DATABASE_URL` itself. `PrismaModule` is `@Global()`, so any feature module can inject `PrismaService` without re-importing it.
- `DATABASE_URL` (see `.env.example`) is a Supabase Postgres connection string — use the pooled ("Transaction pooler") connection string for the app; migrations may need the direct connection instead.
- CORS is enabled in `main.ts` so both `job-seek-web` (`:5173`) and `job-seek-dashboard` (`:4200`) can call it in dev.
- Jest config in `package.json` (unit) and `test/jest-e2e.json` (e2e) both need `moduleNameMapper` stripping `.js` from relative imports — same root cause as the CJS note above (Prisma's generated client imports its own internals with explicit `.js` extensions, which only resolve automatically once Jest is told to treat them as extensionless). e2e tests boot the full `AppModule`, so they require a reachable `DATABASE_URL`.

## Environment

Each app that needs env vars ships a `.env.example` (`job-seek-web`, `job-seek-api`) or a committed `environment.ts` default (`job-seek-dashboard`) — copy/adjust rather than guessing values. `job-seek-cli`'s `.env` stays uncommitted with no example file, per its original convention.

## Git conventions

- Branch off `main` as `feature/<name>` and open a PR back into `main`.
- Commit subjects are short and imperative, no conventional-commit prefixes (e.g. "Add scrapper logic", "Fix 'too much' rewinding command, when last was not permanent").
