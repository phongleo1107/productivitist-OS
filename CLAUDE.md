# Claude Code Project Instructions

This project is a local-first, desktop-first, AI-powered productivity tracker. Claude Code must treat the documentation as the source of truth and work in small, reviewed steps.

## Required Reading

Before starting any task, read:

- `CURRENT_TASK.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/TASKS.md`
- `docs/AI_RULES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DECISIONS.md`

If any document conflicts with the current task, stop and ask the developer before changing files.

## Operating Rules

- Complete only the task described in `CURRENT_TASK.md`.
- Never build the full MVP unless explicitly instructed.
- Never continue to the next task automatically.
- Never make architectural decisions without updating the relevant documentation.
- Never commit, push, merge, rebase, or otherwise finalize Git changes.
- Never assume developer approval.
- Require every implementation to be manually reviewed before continuing.
- Require every Git commit to be performed manually by the developer.
- Summarize every changed file after completing a task.
- Update project documentation only when relevant to the task.
- Suggest the next implementation task instead of automatically starting it.

## Change Constraints

- Do not rewrite unrelated files.
- Do not add new libraries unless the task explicitly allows it or the developer approves it.
- Do not change the existing UI style without approval.
- Keep every change as small and readable as possible.
- If a protected area must change, stop and explain why first.
- If the task requires a new architectural decision, update `docs/DECISIONS.md`.

## Standard Workflow

1. Read the required documentation.
2. Inspect the relevant code or files.
3. Briefly explain the existing structure.
4. Propose the smallest safe change.
5. Implement only the current task.
6. Run relevant checks when available.
7. Fix task-related errors only.
8. Summarize changed files and why they changed.
9. State what should be manually reviewed.
10. Suggest the next task without starting it.

## Project Status (read this first)

- **Current task:** Task 3 (Static Dashboard UI) is in progress. Task 2 (Project Scaffold) was approved by the developer on 2026-07-09. See `CURRENT_TASK.md` for the authoritative scope/status.
- **Do not start Task 4 or any other task** until the developer updates `CURRENT_TASK.md`.
- **Stack:** Electron + React + TypeScript, scaffolded with electron-vite. SQLite is planned for Task 6 (not yet added). Ollama is planned for Task 10 (not yet added).
- **One task at a time:** work only within the scope defined in `CURRENT_TASK.md`. No feature work outside the active task, even if it seems related.
- **Never commit, push, merge, or rebase.** All Git operations are manual and developer-performed.

## Security Notes (Electron main/preload)

- `src/main/index.ts` intentionally keeps `webPreferences.sandbox: false`. **Do not flip this to `true` as a quick fix** — the current preload (`src/preload/index.ts`) imports `@electron-toolkit/preload`, and enabling the sandbox breaks it (`Error: module not found`) unless the preload's Vite/Rollup externalization is reworked first. Treat that rework as its own task.
- `contextIsolation: true` and `nodeIntegration: false` are set explicitly in `webPreferences` — keep them that way.
- Keep the preload's exposed API (`src/preload/index.ts`) narrow; do not widen it beyond what a task explicitly requires.
- External link handling (`setWindowOpenHandler` in `src/main/index.ts`) allowlists URL protocols (`https:`, `http:`, `mailto:`) and wraps `new URL(details.url)` in try/catch, denying on parse failure. Preserve this pattern if the handler is touched again.

## Task 2 Review Status

Task 2 was signed off by the developer on 2026-07-09. Fixes applied during that review round: build scripts (`build:mac`/`build:linux`) aligned with `build`/`build:win` to run typecheck; `appId` aligned between `electron-builder.yml` and `src/main/index.ts`; unused macOS camera/microphone privacy prompts removed from `electron-builder.yml`; `README.md` setup/build instructions added; external URL parsing guarded with try/catch (see Security Notes above).

## Verification Commands

- `npm run typecheck` — type-checks main and renderer.
- `npx eslint --no-cache .` — read-only lint check. Use this over `npm run lint`, which writes `.eslintcache` to disk.
