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

- **Current task:** Task 7 (Pomodoro Timer Behavior) — wire the Focus Room timer to persistence, implement session completion with EXP awards, consecutive-session tracking, and Flow Mode activation.
- **Task 6 status:** Local Persistence Foundation is fully implemented and approved. SQLite schema/migrations, 8 query accessor modules (profile, focus, habits, habit_completions, login, reviews, exp), IPC/preload bridge, and startup wiring all verified end-to-end.
- **Stack:** Electron + React + TypeScript, scaffolded with electron-vite. SQLite (via `better-sqlite3`) is now added and initialized. Ollama is planned for Task 10 (not yet added).
- **One task at a time:** work only within the scope defined in `CURRENT_TASK.md`. No feature work outside the active task, even if it seems related.
- **Never commit, push, merge, or rebase.** All Git operations are manual and developer-performed.

## Model and Worktree Policy

- Claude is the default implementation engineer for routine UI, wiring, tests, documentation, and cleanup.
- GPT-5.6 is reserved for hard contracts and correctness-heavy work: persistence schema design, timer state machines, date/streak logic, EXP/aggregate formulas, Ollama prompt/data contracts, and difficult reviews.
- Fable 5 is escalation-only after GPT-5.6 fails verification, remains stuck after one focused retry, or needs an independent second opinion.
- Do not assign an entire task to GPT-5.6 or Fable 5 when only one slice is difficult.
- If worktrees are used, each agent must run in its own worktree and branch. Never run two agents in the same worktree.
- The main project directory is for coordination, reviews, and final merge decisions.

## Security Notes (Electron main/preload)

- `src/main/index.ts` intentionally keeps `webPreferences.sandbox: false`. **Do not flip this to `true` as a quick fix** — the current preload (`src/preload/index.ts`) imports `@electron-toolkit/preload`, and enabling the sandbox breaks it (`Error: module not found`) unless the preload's Vite/Rollup externalization is reworked first. Treat that rework as its own task.
- `contextIsolation: true` and `nodeIntegration: false` are set explicitly in `webPreferences` — keep them that way.
- Keep the preload's exposed API (`src/preload/index.ts`) narrow; do not widen it beyond what a task explicitly requires.
- External link handling (`setWindowOpenHandler` in `src/main/index.ts`) allowlists URL protocols (`https:`, `http:`, `mailto:`) and wraps `new URL(details.url)` in try/catch, denying on parse failure. Preserve this pattern if the handler is touched again.

## Task 2 Review Status

Task 2 was signed off by the developer on 2026-07-09. Fixes applied during that review round: build scripts (`build:mac`/`build:linux`) aligned with `build`/`build:win` to run typecheck; `appId` aligned between `electron-builder.yml` and `src/main/index.ts`; unused macOS camera/microphone privacy prompts removed from `electron-builder.yml`; `README.md` setup/build instructions added; external URL parsing guarded with try/catch (see Security Notes above).

## Completed Task Status

- Task 3 (Static Dashboard UI) is complete.
- Task 4 (Static Focus Room UI) is complete.
- Task 5 (Static Habit Tracker UI) is complete and ready for manual review.
- Task 6 (Local Persistence Foundation) is complete: SQLite schema/migrations, all query accessors (profile, focus, habits, login, reviews, habit completions with audit & EXP reversal), IPC/preload bridge. Fully tested end-to-end. Ready for manual review before Task 7.

## Verification Commands

- `npm run typecheck` — type-checks main and renderer.
- `npx eslint --no-cache .` — read-only lint check. Use this over `npm run lint`, which writes `.eslintcache` to disk.
