# Current Task

Task 6: Local Persistence Foundation (from `docs/TASKS.md`).

## Goal

Design and implement local data persistence after the developer approves the data model. Data must remain fully local and cover profile settings, focus sessions, habits, completions, EXP, streaks, and AI review history.

Task 5 (Static Habit Tracker UI) was completed and is ready for manual review.
Task 4 (Static Focus Room UI) was completed on 2026-07-09.

## Allowed To Change

- Persistence layer files approved for Task 6
- Data model/schema files approved for Task 6
- Architecture documentation for the approved local storage approach
- `docs/DECISIONS.md` if a storage/schema decision is made
- This file

## Do Not Touch

- Focus Room, Dashboard, Habit Tracker, AI Review, and Settings feature implementations except where a narrow persistence interface or mock-data adapter is explicitly required
- `src/main/` and `src/preload/` unless the approved persistence approach explicitly requires main/preload IPC changes
- Cloud, auth, telemetry, or online database integrations
- Git history
- Unrelated documentation

## Requirements

- Start with a proposed local data model/schema and get developer approval before implementation.
- Data remains fully local.
- Schema or storage shape is documented.
- No cloud, auth, telemetry, or online database is introduced.
- Existing static UI remains functional.
- Keep the persistence surface narrow and testable.
- Prefer a small implementation that can support Tasks 7-10 without overbuilding.
- Do not implement Pomodoro behavior, habit completion behavior, dashboard aggregation, or Ollama review generation in this task.

## Model Split

- Use GPT-5.6 for schema, storage shape, migration strategy, data contracts, and edge-case review.
- Use Claude for implementation after the schema is approved.
- Use Fable 5 only if GPT-5.6 fails verification or needs an independent second opinion.
- Do not spend GPT-5.6 on routine UI wiring, formatting, or simple file edits.

## Completion Checklist

- [x] Relevant documentation was read.
- [x] Proposed data model/schema was reviewed and approved by the developer.
- [x] Only approved files were changed.
- [x] Relevant checks were run or skipped with explanation.
- [x] Changed files were summarized.
- [x] Manual review is ready.
- [x] Next task was suggested but not started.

## Review Status

✅ **Schema (`SCHEMA_PROPOSAL.md`) approved by the developer** on 2026-07-10, after GPT-5.6 design review.

**Approved design includes:**
- UTC timestamps + timezone-aware date derivation
- EXP ledger (1 per focus minute, 10 per habit)
- Streak gap threshold (4 hours for Flow Mode)
- Monday-based ISO weeks for weekly habits
- Calculated streaks (no stored streak tables)
- Consistency = login days / eligible calendar days
- Transaction contracts for multi-table operations

**Confidence: 4/5** (implementation risk around timezone + atomic operations, not schema risk)

---

## Implementation Status

**Stream 1 (GPT-5.6 — schema design):** ✅ Complete

**Stream 2 (Claude — implementation):** ✅ Complete (sub-tasks 6.2–6.8)

- **6.2** Database init/connection utility — `src/main/db/schema.sql`, `src/main/db/migrations/001_init.sql`, `src/main/db/db.ts`. Numbered-migrations approach (not raw `schema.sql` execution), `PRAGMA foreign_keys = ON` on every connection, `level_thresholds` seeded on first launch. Dependency `better-sqlite3` (+ `@types/better-sqlite3`) added with developer approval.
- **6.3** Profile/user accessors — `src/main/db/queries/profile.ts` (`getUser`, `ensureDefaultUser`, `updateUserProfile`; writes only profile/preference columns, never progression).
- **6.4** Focus session accessors — `src/main/db/queries/focus.ts` (`insertFocusSession` — session + EXP award in one transaction, idempotent via `client_event_id`; read helpers).
- **6.5** Habit definition accessors — `src/main/db/queries/habits.ts` (`createHabit`, `getHabit`, `listHabits`, `archiveHabit`).
- **6.6** Login day upsert — `src/main/db/queries/login.ts` (`recordAppOpen`, single-statement upsert per transaction contract #3; `listLoginDates`).
- **6.7** AI review accessors — `src/main/db/queries/reviews.ts` (`insertAiReview`, `getAiReview`, `listAiReviews`, `listAiReviewsForPeriod`, `archiveAiReview`; immutable except archival).
- **Habit completion toggle** (transaction contract #2) — `src/main/db/queries/habitCompletions.ts` (`toggleHabitCompletion` — atomic upsert + audit event + ±10 EXP reversal, idempotent via `client_event_id`; `listCompletedPeriods`).
- **6.8** Preload/IPC exposure — `src/main/db/ipcChannels.ts`, `src/main/db/ipc.ts` (`registerDbIpcHandlers`), `src/main/index.ts` (DB init + `ensureDefaultUser` + `recordAppOpen` + IPC registration wired into `app.whenReady`), `src/preload/index.ts` + `src/preload/index.d.ts` (narrow typed `window.api.db.*` bridge, single-user, no `db`/`userId` args exposed to the renderer).

Shared helpers: `src/main/db/constants.ts` (`DEFAULT_USER_ID`, EXP formula versions/amounts), `src/main/db/dates.ts` (`todayLocalDate`), `src/main/db/queries/exp.ts` (`insertExpEvent`).

All accessors verified with `npm run typecheck`, `eslint --no-cache .`, and functional smoke tests against real `better-sqlite3` connections (idempotency, atomicity/rollback, FK/CHECK enforcement). The full startup path (migration → default user → login upsert → IPC registration) was verified end-to-end by loading the built `out/main/index.js` with a mocked `electron` module — this caught and fixed a real bug (`recordAppOpen` was running before `ensureDefaultUser`, causing a foreign-key failure on a fresh database).

**Not wired to any feature UI.** No Focus Room, Habit Tracker, Dashboard, AI Review, or Settings component calls `window.api.db.*` yet — that begins with Tasks 7–11.

## Notes

Task 6 built the persistence foundation only: schema, migrations, accessors, and the IPC/preload surface. Tasks 7–11 wire feature behavior against this schema and preload API without modifying either. Streak calculation, consistency, and level/EXP totals remain derived at read time from source tables (no stored streak tables were added), per the approved schema.

## Suggested Next Task

**Task 7: Pomodoro Timer Behavior** (per `docs/TASKS.md`) — wire the Focus Room's existing local-state timer (start/pause/reset, added ahead of schedule in commit `2db3e39`) to `window.api.db.insertFocusSession`, add EXP display, consecutive-session tracking, and Flow Mode activation after four completed sessions. Not started; awaiting developer go-ahead to begin.
