# Current Task

Task 8: Habit Completion Behavior (from `docs/TASKS.md`).

## Goal

Wire the Habit Tracker toggles to the local persistence layer, implement habit completion with EXP awards, streak recalculation, and contribution grid updates.

Task 7 (Pomodoro Timer Behavior) was completed on 2026-07-10. The Habit Tracker UI (daily habits with checkboxes, weekly overview, contribution grid) already exists and has local state toggles but zero persistence/behavior wiring yet.

## Allowed To Change

- Habit Tracker feature files (`src/renderer/src/features/habitTracker/*`)
- Persistence integration files (calls to `window.api.db.*`)
- Display/state for EXP, completions, streaks, contribution grid
- CSS refinements for habit completion feedback
- Tests if added
- This file

## Do Not Touch

- Other feature UI (Dashboard, Focus Room, AI Review, Settings) unless explicitly required
- The persistence layer itself (Task 6 is finalized; no schema/accessor changes unless a bug is found)
- Core checkbox toggle logic (already works locally; only add persistence/behavior)
- `src/main/` or `src/preload/` unless fixing a discovered bug
- Git history, unrelated documentation

## Requirements

- Completed habit periods are saved via `window.api.db.toggleHabitCompletion()`.
- EXP awards calculated per the approved formula: 10 EXP per completed habit period (daily or weekly), -10 EXP on unmark (reversal).
- EXP is displayed to the user (on toggle or in session stats).
- Habit streaks are recalculated and updated after each toggle (current streak, best streak).
- Contribution grid shows real completion history instead of mock data.
- Habit period metadata captured: `habitId`, `periodStart` (YYYY-MM-DD for daily, Monday date for weekly), `completed` (boolean), `period_type` (matches habit frequency).
- Idempotency: a toggle is idempotent via a stable `client_event_id` (prevent double-awards on retry).
- Weekly overview updates to reflect real completions.
- Daily count ("Today: X/Y") updates live after toggles.
- Streak counter with flame emoji (🔥) updates live.
- No persistence or behavior changes to dashboard mock data or focus room (they stay local-state only until their respective tasks).
- Loading/persistence failures must be shown to the user (not just `console.error`), with a way to retry.
- A minimal "Add Habit" form (name + daily/weekly frequency, wired to `window.api.db.createHabit()`) — approved by the developer as a scope addition on 2026-07-10, since the Habit Tracker previously had no way to create a habit beyond the 5 auto-seeded starter habits.

## Completion Checklist

- [x] Relevant documentation was read.
- [x] Habit Tracker toggles are wired to `window.api.db.toggleHabitCompletion()`.
- [x] Habit completion toggles calculate and award EXP correctly (10 per completion, -10 on unmark).
- [x] Habit streaks are recalculated and displayed after toggles.
- [x] Contribution grid shows real completion history.
- [x] Weekly overview reflects real completion data.
- [x] Daily count and streak displays update live.
- [x] EXP is displayed to the user (toast or inline).
- [x] Habit period metadata (habitId, periodStart, completed, period_type) is captured correctly.
- [x] Idempotency via `client_event_id` is implemented.
- [x] Relevant checks (`npm run typecheck`, `eslint`) pass.
- [x] Loading/persistence errors are shown in the UI with a Retry action, not swallowed silently.
- [x] Add Habit form works end-to-end against `window.api.db.createHabit()` (approved scope addition).
- [x] Changed files were summarized.
- [x] Manual review is ready.
- [ ] Next task was suggested but not started.

## Review Status

Implementation complete across all three parallel Claude sessions. Verified via a standalone 32-case integration test (see Notes) run against the real compiled query modules and the actual migration schema — all passed. `npm run typecheck` and `npx eslint --no-cache` both clean.

**Follow-up fix (2026-07-11):** developer reported no habits appearing and no way to create one, then couldn't launch the Electron app at all to test (`npm run dev` / `npm run start` failed with a native-module ABI mismatch and a Linux sandbox crash). Root-caused both:

1. **`better-sqlite3` ABI mismatch** (`NODE_MODULE_VERSION 127/115 vs 140`): a `npm rebuild better-sqlite3 --build-from-source` run during troubleshooting rebuilt the native module against the system's plain Node.js instead of Electron's bundled Node ABI, breaking the correct build `npm install`'s `postinstall` (`electron-builder install-app-deps`) had already produced. **Fix:** re-run `npm install` (not a manual `npm rebuild`) — its postinstall hook rebuilds `better-sqlite3` for Electron automatically.
2. **`FATAL: No usable sandbox!`**: this Linux environment has unprivileged user namespaces restricted (AppArmor), so Chromium's SUID sandbox can't initialize. `npm run dev -- --no-sandbox` doesn't work (electron-vite's CLI rejects unregistered flags), but electron-vite has its own registered flag for this. **Fix:** `npm run dev -- --noSandbox` (camelCase) — this sets `NO_SANDBOX=1`, which Chromium's zygote host reads directly.

Confirmed working end-to-end: after `npm install` + `npm run dev -- --noSandbox`, the Electron window launched cleanly with no crashes. Developer should verify in that window that the 5 seeded habits appear, toggle correctly, and the new Add Habit form works.

(A Docker containerization path was explored as an alternative and successfully got the app running headless in a container too, but once the actual host-side root causes were found, Docker was no longer necessary and was removed.)

Separately, the original silent-failure and scope-gap issues were also fixed:
- Root cause for "no habits" was, more fundamentally, that `window.api.db.*` would throw if the Electron process was stale (main/preload changes need a full restart, unlike the renderer which Vite hot-reloads) — `HabitTracker.tsx`'s load path was swallowing that into `console.error` only, leaving a blank list with no visible error.
- "No way to create a habit" was a genuine, confirmed scope gap (Task 5 and Task 8 only ever seeded/toggled the 5 mock-derived habits). Developer approved adding a minimal Add Habit form as an in-scope addition.

Fixes shipped:
- `HabitTracker.tsx` now surfaces load failures in the UI (`tracker-error` state with a Retry button) instead of only logging to console.
- New `AddHabitForm.tsx` lets the user create a habit (name + daily/weekly) via the already-working `window.api.db.createHabit()`.
- Both verified in the browser preview: the error state, Retry button, form rendering, empty-name validation, and the create-habit failure path all behave correctly (this preview environment has no `window.api`, which is itself a useful negative-path test).

Awaiting manual developer review before Task 9.

**Second follow-up fix (2026-07-11):** developer reported three more issues after using the tracker:

1. The Completion History grid's "Less → More" legend implied intensity levels, but every completed day rendered identically (`day-cell.completed` was a flat binary state, never the legend's low/medium opacity levels).
2. Habit rows didn't show whether a habit was daily or weekly.
3. Completing a weekly habit only lit up its `period_start` (Monday) cell in the Completion History grid instead of the whole ISO week — `buildContributionGrid` did a raw string match of `period_start` against each calendar date, instead of using the existing `isPeriodCompletedOnDate` helper (which `WeeklyOverview.tsx` already used correctly, and which resolves any date in a completed week to the same period key).

Fixes shipped:
- `habitStats.ts`: `buildContributionGrid` now takes each habit's `frequency` and uses `isPeriodCompletedOnDate` per day, so a completed weekly period lights up all 7 days of its week. It now also returns `completionRatio` (fraction of habits completed that date) instead of only a boolean.
- `ContributionGrid.tsx` buckets `completionRatio` into empty/low/medium/high and renders the matching CSS class, so the existing legend now reflects real data.
- `DailyHabits.tsx` shows a small "Daily"/"Weekly" badge next to each habit name.
- `mockData.ts` and `habitTracker.css` updated to match (mock grid data now carries a `completionRatio`; CSS gained `.day-cell.level-*` classes and a `.habit-frequency` badge style).
- `HabitTracker.tsx`'s three `buildContributionGrid` call sites updated to pass habit frequency data.

Verified by compiling the actual `habitStats.ts` with `tsc` in an isolated scratchpad and exercising `buildContributionGrid` against a mixed daily+weekly completion set: a weekly completion correctly lit up all 7 days of its ISO week with the right per-day `completionRatio` (e.g. a day with both a daily and weekly habit done showed ratio 1; a day with only the weekly habit done showed 0.5). Electron's GUI can't be exercised in this environment (no display), and the browser preview has no `window.api`, so this was verified at the logic level rather than pixel-level; visual appearance of the new badge and intensity levels should be manually reviewed. `npm run typecheck` and `npx eslint --no-cache src/renderer/src/features/habitTracker/` both clean.

Awaiting manual developer review.

**Third follow-up fix (2026-07-11):** developer reported the Completion History grid had a missing Saturday row, a misplaced box in April, and month labels that didn't reflect the real trailing window.

Root cause: `ContributionGrid.tsx` grouped history into week columns by chunking on Sundays, but rendered each column as a plain flex column with no explicit day-of-week row assignment. Whichever column (first or last) didn't start on Sunday ended up with fewer than 7 entries pushed to the top of that column — visually shifting it out of alignment with the Sun-Sat day-axis labels. Month labels were also hardcoded static strings (`Apr`, `May`, `Jun`), not computed from real dates, so they didn't move with the actual date range.

Fixes shipped:
- `ContributionGrid.tsx`: `buildWeeks` now pads the first and last week columns with `null` placeholders so every column always has exactly 7 slots aligned Sun-Sat, regardless of which weekday the 90-day window starts or ends on.
- `buildMonthLabels` computes real month-label positions by walking the padded grid for month transitions in the actual data, replacing the hardcoded strings — labels now always reflect the true trailing months ending today (e.g. Apr/May/Jun/Jul for a window ending 2026-07-11), never a stale or future-looking set.
- `habitTracker.css`: `.month-labels` switched from equal-flex spacing to absolute positioning (`left: weekIndex * 20px`, matching the 16px cell + 4px gap pitch) so labels land above the correct column; added `.day-cell-placeholder` (fully transparent) so padding cells reserve grid space without rendering as fake "no completion" days.

Verified visually in the browser preview (this component only takes a `history` array prop, no `window.api` dependency, so full rendering was possible): with today = 2026-07-11 (a Saturday) and a 90-day window starting 2026-04-12 (a Monday), the first week column correctly had exactly 1 placeholder (for the Sunday before the window start) and the last column had 0 (the window ends exactly on Saturday); month labels rendered at the correct computed pixel offsets for Apr/May/Jun/Jul. `npm run typecheck` and `npx eslint --no-cache` both clean.

Awaiting manual developer review.

**Fourth follow-up fix (2026-07-11):** developer reported the Saturday row was *still* missing after the third fix above, and asked for weekly habits to render as one continuous Monday-to-Sunday bar.

Two separate bugs, missed by the prior verification pass (which checked placeholder counts and label offsets but not actual row-to-row pixel alignment):

1. `.day-axis .day-label` was `height: 20px` while `.day-cell` was `height: 16px`. Both columns used the same `gap: 4px`, but the 4px-per-row height difference compounds down 7 rows — by the last row the day-axis label sat 24px lower than the corresponding grid cell, so the "SAT" label pointed at empty space below the actual last row of cells (which visually reads as "the Saturday row is missing").
2. The grid used Sunday-start (Sun-Sat) ordering, but the rest of the app is Monday-start ISO weeks (`week_starts_on: 1` in the schema, `getMondayForDate`/`period_start` for weekly habits, and `WeeklyOverview.tsx`'s own `['Mon', ..., 'Sun']` labels). A completed weekly habit's 7 contiguous days therefore got split across two different Sun-Sat columns instead of forming one clean vertical bar.

Fixes shipped:
- `habitTracker.css`: `.day-axis .day-label` height changed from `20px` to `16px` to exactly match `.day-cell`, so all 7 rows in the day-axis and every week column now line up pixel-for-pixel.
- `ContributionGrid.tsx`: `DAY_NAMES` reordered to `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`; added `isoDayOfWeek()` (Monday=0...Sunday=6, vs. JS's native Sunday=0...Saturday=6) and used it in `buildWeeks` instead of the raw `getUTCDay()`, so week columns are now Monday-start and align with how weekly habit periods are actually computed everywhere else.

Verified in the browser preview via computed layout, not just data: `.day-axis` and a `.week` column now report the exact same `getBoundingClientRect().height` (136px = 136px, previously mismatched). With today = 2026-07-11 (Saturday → ISO index 5) and the window start 2026-04-12 (Monday → ISO index 0), the first week column now correctly needs 0 placeholders (the window starts exactly on a Monday) and the last needs exactly 1 (for the trailing Sunday) — 13 weeks × 7 = 91 slots for 90 real days + 1 placeholder, matching exactly. `npm run typecheck` and `npx eslint --no-cache` both clean.

**Scope addition (2026-07-11):** developer requested three enhancements: (1) let the user delete a habit, (2) separate the habit list into distinct Daily/Weekly sections instead of mixing both frequencies in one "Daily Habits" list, (3) use the Completion History grid's unused horizontal space by visually separating the 3-4 months in view.

Implementation:
- **Delete habit**: `DailyHabits.tsx` renamed to `HabitList.tsx` (it now renders either frequency, not just daily) and gained a `×` delete button per row plus an `onDeleteHabit` prop. `HabitTracker.tsx`'s new `handleDeleteHabit()` confirms via `window.confirm()`, calls the already-existing `window.api.db.archiveHabit()` (a soft-delete already in the persistence layer since Task 6 — `archived=1`, completion history and EXP history are preserved, it just drops out of `listHabits()`'s default active-only view), then removes it from local `habits`/`completionsByHabit` state and rebuilds the contribution grid.
- **Daily/Weekly split**: `HabitTracker.tsx` now filters `habits` into `dailyHabits`/`weeklyHabits` and renders two `<HabitList>` sections with their own "Daily Habits"/"Weekly Habits" headings and independent empty states, instead of one mixed list. `AddHabitForm` (which already lets the user pick daily or weekly) stayed as a single instance under the Weekly section.
- **Completion History spacing**: `ContributionGrid.tsx` now inserts a `MONTH_GAP_EXTRA` (16px) gap before the first week column of every new month (on top of the normal 6px column gap, itself widened from 4px alongside `.day-cell` widening from 16px to 18px), via a `computeWeekOffsets()` helper that also keeps the month-label pixel positions in sync with the added gaps (label position can no longer be a flat `weekIndex * pitch` once gaps are non-uniform).
- CSS: `.daily-habits-list` renamed to `.habit-list`; added `.habit-delete-button` (subtle, reddens on hover); `.weeks` gap 4px→6px; `.day-cell` width 16px→18px (height unchanged at 16px to preserve the row-alignment fix above).

Verified in the browser preview with a hand-mocked `window.api` (the real one isn't available in this environment's static preview, so `listHabits`/`archiveHabit`/etc. were stubbed to exercise the actual component logic): confirmed two sections render with the correct habit grouped by frequency, all delete buttons are present, clicking delete (with `window.confirm` auto-accepted) correctly removes the habit from its section, and the Completion History grid's column gaps measured via `getBoundingClientRect()` are exactly 6px normally and 22px (6 + 16) at each of the 3 month boundaries for the Apr-Jul span. `npm run typecheck` and `npx eslint --no-cache` both clean.

Awaiting manual developer review.

**Second scope addition (2026-07-11):** developer clarified the Completion History fix wasn't enough (still wanted the grid to actually stretch and fill the container, not just have gaps) and requested manual habit reordering.

Implementation:
- **Fluid Completion History grid**: `ContributionGrid.tsx` restructured `.weeks` and `.month-labels` from fixed-pixel flexbox layouts into CSS Grid with `grid-template-columns` built from a track list — one fluid `1fr` track per week plus a fixed `16px` spacer track at each month boundary — computed by a new `buildTracks()` helper and applied identically to both the label row and the week columns (via matching inline `gridTemplateColumns`), with each month label's position set via `gridColumnStart` instead of a manually-computed pixel offset. `.day-cell` width changed from a fixed `18px` to `100%` so cells stretch to fill their fluid grid column (height stays fixed at `16px`, preserving the earlier row-alignment fix). The Less/More legend swatches, which reuse the `.day-cell` class but aren't part of this grid, got an explicit `.legend-cells .day-cell { width: 16px; flex: none }` override so they don't also stretch. `.weeks` gained `flex: 1; min-width: 0` so it fills whatever space `.contribution-grid`'s flexbox leaves after the fixed-width day-axis sidebar.
- **Manual habit reordering**: `HabitList.tsx` gained ▲/▼ buttons per row (disabled at each section's first/last position) and an `onReorderHabit` prop. `HabitTracker.tsx`'s `handleReorderHabit()` swaps a habit with its nearest same-frequency sibling (so reordering within "Daily Habits" never touches the "Weekly Habits" section's relative order) by locating both habits' real indices in the full `habits` array and swapping them there. Order is **not** a new database column — the Task 6 habits schema is finalized and a sort-order column would be a schema change outside this task's approved scope — instead it's a display-only preference persisted to `localStorage` (`habitTracker.habitOrder`, an ordered array of habit ids) via `saveHabitOrder()`/`loadHabitOrder()`/`applyHabitOrder()`, applied whenever habits are loaded and updated on every add/delete/reorder. Habits not yet in the saved order (e.g. brand new ones) sort stably to the end.

Verified in the browser preview with the same hand-mocked `window.api` approach: measured actual rendered pixel widths and confirmed the grid now fills 100% of its available space (day-cell width auto-computed to 23px from the available 437px container width, versus the previous fixed 18px), legend swatches stayed fixed at 16px, and month labels positioned correctly via the grid-column approach. Confirmed reordering end-to-end: clicking "move up" on a habit swaps its position within its own frequency section only, boundary buttons are correctly disabled at each section's first/last item, the new order is written to `localStorage`, and — after a full page reload with the mock reinstalled — the saved order is correctly re-applied on load. `npm run typecheck` and `npx eslint --no-cache` both clean.

Awaiting manual developer review.

**Third scope addition (2026-07-11):** developer requested drag-and-drop reordering as an alternative to the ▲/▼ buttons.

Implementation:
- `HabitList.tsx` now tracks drag state via `draggedIndex` and `dragOverIndex` (React useState). Each habit item is `draggable` and bound to `onDragStart` (sets `draggedIndex`), `onDragOver` (sets `dragOverIndex` and prevents default), `onDragLeave` (clears `dragOverIndex`), `onDrop` (validates same-frequency constraint, calculates swap direction up/down, calls `onReorderHabit` in a loop to move from source to target position, then clears drag state), and `onDragEnd` (clears drag state). The drop handler iterates the `onReorderHabit` callback — if source is at index 2 and target is at index 0, it calls `onReorderHabit(..., 'up')` twice; if dragging down, it calls 'down' the appropriate number of times — reusing the existing button-driven reorder logic so `localStorage` persistence is automatic.
- CSS: `.habit-item[draggable='true']` sets `cursor: grab`; `:active` shows `grabbing`; `.habit-item-dragging` fades the source to 50% opacity and dims its background; `.habit-item-drag-over` shows a top border in purple to indicate the drop target.
- The ▲/▼ buttons remain, so users can mix drag and click reordering.

Verified: `draggable` attribute properly set on all habit items, drag classes correctly applied to DOM elements. `npm run typecheck` and `npx eslint --no-cache` both clean.

Awaiting manual developer review.

### Verification detail

Since this environment has no display for a full Electron GUI run, verification was done by compiling the actual source modules (`queries/habits.ts`, `queries/habitCompletions.ts`, `queries/exp.ts`, `habitStats.ts`) with `tsc` to CommonJS in an isolated scratchpad directory, then exercising them against a real in-memory SQLite database seeded with the project's actual `001_init.sql` migration (not a reimplementation). 32 assertions covered:

- Habit creation (daily + weekly)
- Mark → EXP +10, idempotent retry (same `client_event_id`) → no double-award
- Unmark → EXP -10 reversal; re-mark → EXP +10 again
- Level calculation from EXP total
- Streak continuity across 5 consecutive days, and streak reset to 1 after a gap
- `isPeriodCompletedOnDate` for both completed and empty habits
- Contribution grid: 90-day array, correct completion marking
- Weekly habit period alignment to Monday (ISO week)
- `period_type` always follows the habit's own `frequency`, not caller assumptions
- Nonexistent habit throws the expected error
- `listHabits` returns all created habits

Separately confirmed every renderer call (`listHabits`, `createHabit`, `toggleHabitCompletion`, `listCompletedPeriods`, `getCurrentExp`, `getCurrentLevel`) has a matching handler in `src/main/db/ipc.ts` backed by the real query functions — no gaps between preload, IPC, and persistence.

## Notes

The Habit Tracker UI with checkbox toggles already works locally (Task 8.1 completed). This task adds the backend: saving completions to DB, calculating streaks, updating the grid, and displaying EXP awards.

EXP formula: 10 per completed period (daily or weekly). Unmarking a habit writes a -10 EXP reversal. Both are idempotent via client_event_id per SCHEMA_PROPOSAL.md "exp_events" contract.

Weekly habits use Monday-based ISO weeks per SCHEMA_PROPOSAL.md. Daily habits use local date (YYYY-MM-DD). The `period_type` column must match the habit's immutable `frequency`.
