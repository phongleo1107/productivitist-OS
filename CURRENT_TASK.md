# Current Task

Task 4: Static Focus Room UI (from `docs/TASKS.md`).

## Goal

Build the Focus Room visual shell without integrations: Pomodoro timer layout, music/ambient/background selectors as UI entry points, session stats, focus streak, and today's focused time—all with mock data only. No timers, no behavior, no persistence, no music/Spotify integration.

Task 3 (Static Dashboard UI) was signed off by the developer on 2026-07-09.

## Allowed To Change

- `src/renderer/src/features/focusRoom/` (new focus room feature files)
- `src/renderer/src/App.tsx` (mount the focus room or add routing)
- `src/renderer/src/assets/` (shared styling and design tokens, only if new tokens needed)
- Shared UI components under `src/renderer/src/` only if duplication becomes meaningful
- This file

## Do Not Touch

- `src/main/` and `src/preload/` (a static UI needs no main/preload changes)
- Dashboard, Habit Tracker, AI Review, and Settings feature implementations
- Database schema or persistence
- Spotify or Ollama integration
- Git history
- `docs/PRD.md`, `docs/TASKS.md`, `docs/AI_RULES.md`, `docs/DESIGN_SYSTEM.md`, `CLAUDE.md`

## Requirements

- Focus Room matches the PRD and design direction: calm, immersive deep work environment.
- Pomodoro timer is the visual anchor (display the layout, mock time value like "25:00"; timer behavior arrives in Task 7).
- Spotify integration entry point (button/link, no actual Spotify connection) and local music UI (marked as future-ready, no player code).
- Ambient sound selector UI (visual entry point only, no actual audio).
- Background selector UI (visual entry point only, no real backgrounds).
- Session stats and focus streak displayed with mock data (from the dashboard's mock pool or local mock).
- Today's focused time stat (mock value, no persistence).
- All data is static or mocked.
- Dark-first, purple-accent aesthetic consistent with the dashboard.
- No new dependencies.

## Completion Checklist

- [x] Relevant documentation was read.
- [x] Only approved files were changed.
- [x] Relevant checks were run or skipped with explanation.
- [x] Changed files were summarized.
- [x] Manual review is ready.
- [ ] Next task was suggested but not started.

## Review Status

Awaiting manual developer review.

## Notes

Mock data for the Focus Room lives inside its own feature directory. Task 7 (Pomodoro Timer Behavior) wires up the timer logic. Persistence arrives in Task 6.
