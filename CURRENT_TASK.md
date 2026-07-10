# Current Task

Task 7: Pomodoro Timer Behavior (from `docs/TASKS.md`).

## Goal

Wire the Focus Room timer to the local persistence layer, implement session completion with EXP awards, consecutive-session tracking, and Flow Mode activation.

Task 6 (Local Persistence Foundation) was completed on 2026-07-10. The Focus Room timer UI (start/pause/reset countdown) already exists from commit `2db3e39` but has zero persistence/behavior wiring yet.

## Allowed To Change

- Focus Room feature files (`src/renderer/src/features/focusRoom/*`)
- Persistence integration files (calls to `window.api.db.*`)
- Display/state for EXP, session count, consecutive sessions, Flow Mode activation
- CSS refinements for Flow Mode visual feedback
- Tests if added
- This file

## Do Not Touch

- Other feature UI (Dashboard, Habit Tracker, AI Review, Settings) unless explicitly required
- The persistence layer itself (Task 6 is finalized; no schema/accessor changes unless a bug is found)
- Core timer countdown logic (the interval-based timer works; only add completion/persistence behavior)
- `src/main/` or `src/preload/` unless fixing a discovered bug
- Git history, unrelated documentation

## Requirements

- Completed focus sessions are saved via `window.api.db.insertFocusSession()`.
- EXP awards calculated per the approved formula: 1 EXP per completed minute (minimum 1).
- EXP is displayed to the user (on session complete or in session stats).
- Consecutive session tracking: sessions started within 4 hours of the previous session's completion form a chain.
- Flow Mode activates (UI feedback) after 4 consecutive completed sessions in a chain.
- Flow Mode visual treatment is subtle (opacity/glow, not aggressive).
- Session metadata captured: `plannedDurationMinutes`, `actualDurationSeconds` (from the countdown), `started_at`, `completed_at` (ISO timestamps), `session_date` (local date of completion).
- Idempotency: a session completion is idempotent via a stable `client_event_id` (caller responsibility; prevent double-awards on retry).
- No persistence or behavior changes to dashboard mock data or habit toggles (they stay local-state only until their respective tasks).

## Model Split

- **GPT-5.6:** Timer state machine, completion rules, EXP formula application, consecutive-session chain logic, Flow Mode edge cases (midnight crossing, timezone edge cases if relevant).
- **Claude:** UI wiring (button → DB call), EXP display, Flow Mode CSS/state, focus stats updates, tests.

## Completion Checklist

- [ ] Relevant documentation was read.
- [ ] Focus Room timer is wired to `window.api.db.insertFocusSession()`.
- [ ] Session completion calculates and awards EXP correctly.
- [ ] Consecutive sessions are tracked (4-hour gap threshold).
- [ ] Flow Mode activates after 4 consecutive completed sessions.
- [ ] Flow Mode visual feedback is present and subtle.
- [ ] EXP is displayed to the user.
- [ ] Session metadata (duration, times, date) is captured correctly.
- [ ] Idempotency via `client_event_id` is implemented.
- [ ] Relevant checks (`npm run typecheck`, `eslint`) pass.
- [ ] Changed files were summarized.
- [ ] Manual review is ready.
- [ ] Next task was suggested but not started.

## Review Status

Not started. Awaiting developer confirmation of scope and model split assignment.

## Notes

The Focus Room timer countdown (start/pause/reset) is already functional and local-only (no persistence). This task adds the backend: saving the completed session, calculating EXP, tracking chains for Flow Mode, and wiring the UI to show these updates.

The 4-hour gap threshold for consecutive sessions is per SCHEMA_PROPOSAL.md "Flow Mode consecutive sessions." A session started 4 hours after the previous one's completion counts as consecutive; anything beyond breaks the chain.

EXP formula: `floor(actual_duration_seconds / 60)` with a minimum of 1. This is already implemented in `src/main/db/queries/focus.ts` (`focusExpAward`).
