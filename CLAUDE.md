# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`job-seek` is a Node/TypeScript CLI that scrapes job openings from multiple job boards, filters them to user preferences, and can generate a tailored CV (via Gemini) as a PDF for a given job posting. It's a single package (not a monorepo), package manager is pnpm (pinned via `packageManager` in package.json — use `pnpm`, not `npm`/`yarn`).

## Commands

- `pnpm dev` — run the CLI directly via `tsx src/index.ts`
- `pnpm build` — typecheck + emit via `tsc`
- `pnpm start` — run the built output (`node dist/index.js`)
- `pnpm lint` — `eslint . --fix` (auto-fixes; also runs Prettier as an ESLint rule)
- `pnpm format` — `prettier --write .`
- There is no test suite yet (`pnpm test` is a stub). A real framework is planned but not set up — don't assume Jest/Vitest exist, and verify changes by running the CLI (`pnpm dev`) rather than writing tests, unless the user asks you to set up a framework first.

## Architecture

- **DI**: `tsyringe` throughout — classes are `@injectable()`, dependencies pulled via constructor `@inject(...)`. `reflect-metadata` is imported first in `src/index.ts` and must stay first.
- **Commands** (`src/commands/`): each command extends `BaseCommand<T>` (`src/commands/base-command.ts`) and implements `getKey()` and `execute()`. Commands return a stack of `NextCommandToExecute` to push, driving `app-manager`'s command-stack loop rather than direct function calls.
- **Job resolvers** (`src/resolvers/seek-job/*.resolver.ts`): each job board (e.g. `just-join-it`, `no-fluff-jobs`, `protocol-it`, `solid-jobs`) extends the abstract `SeekJobResolver<T>` (`src/resolvers/seek-job.resolver.ts`), implementing `getBaseUrl`, `getSeekJobsSuffix`, `getSeekJobDetailsSuffix`, `resolveMany`, `resolveOne`. Note: `src/resolvers/just-join-it.ts`, `src/resolvers/seek-job.ts`, and `src/resolvers/seek-job.resolver.ts` at the resolvers root are legacy/duplicate files from before the `seek-job/` subfolder — check which one is actually imported before editing either copy.
- **Services** (`src/services/`): `web-scrapper.service.ts` spawns a Python subprocess (`python3 -u ./scripts/nodriver_scrapper.py <url>`) for browser-driven scraping via `nodriver`. Python deps (`nodriver`, etc.) are installed globally, not via a `requirements.txt`/venv — `python3` and `nodriver` must simply be importable from PATH. `tailored-cv.service.ts` calls Gemini to tailor a CV from a master CV JSON + job description; `cv-pdf.service.ts` renders the result to PDF using a template from `src/templates/layouts/`.
- Imports use explicit `.ts`/`.js` extensions everywhere (required by `moduleResolution: NodeNext` + ESM) — don't drop them.
- TypeScript is `strict: true`; keep new code strict-clean.

## Environment

- `.env` (gitignored, no committed `.env.example`) needs `GEMINI_API_KEY`; `GEMINI_MODEL` is optional (defaults to `gemini-2.5-flash`). Both are read in `src/services/tailored-cv.service.ts`.
- `preferences.enc` is an encrypted local preferences file (seek sources/techstack) via `@boringnode/encryption` — don't try to read/edit it as plain text.

## Git conventions

- Branch off `main` as `feature/<name>` and open a PR back into `main` (matches the existing `feature/generate-tailored-cv` → `main` history).
- Commit subjects are short and imperative, no conventional-commit prefixes (e.g. "Add scrapper logic", "Fix 'too much' rewinding command, when last was not permanent").
