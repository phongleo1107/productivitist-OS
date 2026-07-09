# Current Task

Task 5: Static Habit Tracker UI (from `docs/TASKS.md`).

## Goal

Build the Habit Tracker visual shell with mock data only: daily habits list, weekly overview, GitHub-style contribution grid, habit streaks, and completion history. No behavior, no persistence, no habit creation/editing.

Task 4 (Static Focus Room UI) was completed on 2026-07-09.

## Allowed To Change

- `src/renderer/src/features/habitTracker/` (new habit tracker feature files)
- `src/renderer/src/App.tsx` (wire the habit tracker navigation)
- `src/renderer/src/features/dashboard/FeatureCardsRow.tsx` (add navigation callback if needed)
- `src/renderer/src/assets/` (shared styling and design tokens, only if new tokens needed)
- Shared UI components under `src/renderer/src/` only if duplication becomes meaningful
- This file

## Do Not Touch

- `src/main/` and `src/preload/` (a static UI needs no main/preload changes)
- Focus Room, Dashboard, AI Review, and Settings feature implementations
- Database schema or persistence
- Git history
- `docs/PRD.md`, `docs/TASKS.md`, `docs/AI_RULES.md`, `docs/DESIGN_SYSTEM.md`, `CLAUDE.md`

## Requirements

- Habit Tracker matches the PRD and design direction: low-friction habit completion UI inspired by Habitify Desktop.
- Daily habits list with completion checkboxes (visual only, no state changes).
- Weekly overview showing habit completion status for the past 7 days.
- GitHub-style contribution grid showing completion history across a date range (e.g., last 3 months).
- Habit streaks displayed for each habit (mock values, no persistence).
- Completion history visible in the grid and weekly view.
- Mock data showing various completion states (some habits completed today, varied streak lengths, grid history).
- All data is static or mocked.
- Dark-first, purple-accent aesthetic consistent with the dashboard and focus room.
- Low-friction controls (checkboxes appear intuitive, even though they're static).
- No new dependencies.
- No habit creation, editing, or deletion UI (deferred to future task).

## Completion Checklist

- [x] Relevant documentation was read.
- [x] Only approved files were changed.
- [x] Relevant checks were run or skipped with explanation.
- [x] Changed files were summarized.
- [x] Manual review is ready.
- [ ] Next task was suggested but not started.

## Review Status

✅ Task 5 Complete. Habit Tracker is fully built, integrated, and navigable from Dashboard.

## Notes

Mock data for the Habit Tracker lives inside its own feature directory. Task 8 (Habit Completion Behavior) wires up completion logic and EXP awards. Persistence arrives in Task 6.
