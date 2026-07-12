# Data Model

The persistence layer stores all user data locally in SQLite. This document describes the schema structure, derived metrics, transaction contracts, and feature data ownership.

## Tables

### `users`

Single-user profile, display settings, and calendar preferences. Progression data does not live here.

- **Primary key:** `id` (TEXT)
- **Key columns:**
  - `name` — user display name
  - `theme` — 'dark', 'light', or 'system'
  - `accent_color` — UI accent color (hex)
  - `time_zone` — IANA timezone name (e.g., 'Asia/Ho_Chi_Minh')
  - `week_starts_on` — 0 (Sunday) to 6 (Saturday); MVP uses 1 (Monday)
  - `tracking_start_date` — local calendar date when tracking began
  - `profile_picture_path`, `background_image_path` — optional image paths
  - `created_at`, `updated_at` — UTC timestamps

### `login_days`

One row per local calendar day the user opened the app.

- **Primary key:** `(user_id, login_date)`
- **Key columns:**
  - `login_date` — local date (YYYY-MM-DD)
  - `first_opened_at`, `last_opened_at` — UTC timestamps for that day
  - `open_count` — number of times opened that day

**Behavior:** Upserted once per startup; increments `open_count` and updates `last_opened_at`.

### `focus_sessions`

Immutable record of completed focus sessions. In-progress or abandoned timers are not stored.

- **Primary key:** `id` (AUTOINCREMENT)
- **Unique key:** `client_event_id` (for idempotent retries)
- **Key columns:**
  - `user_id` — foreign key to `users`
  - `session_date` — local date (when completed)
  - `planned_duration_minutes` — user's intended length
  - `actual_duration_seconds` — actual elapsed time
  - `started_at`, `completed_at` — UTC timestamps
  - `created_at` — UTC timestamp

**Indexes:** `(user_id, session_date)`, `(user_id, completed_at)`

### `habits`

Habit definitions. Archived habits are permanent; recreating a habit creates a new record.

- **Primary key:** `id` (TEXT, app-generated UUID)
- **Key columns:**
  - `user_id` — foreign key to `users`
  - `name` — habit display name
  - `frequency` — 'daily' or 'weekly'
  - `created_date` — local date when defined
  - `archived` — 0 (active) or 1 (archived)
  - `archived_at` — UTC timestamp if archived
  - `created_at`, `updated_at` — UTC timestamps

**Constraint:** `frequency` is immutable once completions exist.

### `habit_completions`

Current completion state for one habit period. Rows are toggled between complete and incomplete.

- **Primary key:** `id` (AUTOINCREMENT)
- **Unique key:** `(habit_id, period_start)`
- **Key columns:**
  - `habit_id` — foreign key to `habits`
  - `period_type` — 'daily' or 'weekly' (must match habit's `frequency`)
  - `period_start` — local date (for daily: that date; for weekly: Monday of ISO week)
  - `completed` — 0 (incomplete) or 1 (complete)
  - `revision` — incremented on each toggle
  - `created_at`, `updated_at` — UTC timestamps

**Index:** `(period_start, completed)`

**Behavior:** Toggling a completion increments `revision`, updates `updated_at`, and triggers a corresponding `habit_completion_event` and EXP adjustment in the same transaction.

### `habit_completion_events`

Append-only audit trail for habit completion toggles. Enables repair, conflict resolution, and correct EXP reversals.

- **Primary key:** `id` (AUTOINCREMENT)
- **Unique key:** `client_event_id` (for idempotent retries)
- **Key columns:**
  - `completion_id` — foreign key to `habit_completions`
  - `revision` — the completion's `revision` after this event
  - `completed` — 0 or 1 (the new state)
  - `occurred_at` — UTC timestamp

**Constraint:** `(completion_id, revision)` is unique; each revision has exactly one event.

### `exp_events`

Append-only EXP ledger. Rows are never updated or deleted; negative values reverse awards.

- **Primary key:** `id` (AUTOINCREMENT)
- **Unique key:** `idempotency_key` (for retries)
- **Key columns:**
  - `user_id` — foreign key to `users`
  - `source_type` — 'focus_session', 'habit_completion', or 'adjustment'
  - `source_id` — ID of the source (focus session ID or habit completion event ID)
  - `amount` — EXP delta (positive or negative; never zero)
  - `formula_version` — EXP formula version (currently 1)
  - `reason` — optional explanation
  - `created_at` — UTC timestamp

**Indexes:** `(user_id, created_at)`, `(source_type, source_id)`

**Formula (v1):**
- Focus session: 1 EXP per completed minute (min 1 EXP)
- Habit completion: +10 EXP on mark, -10 EXP on unmark

### `level_thresholds`

Versioned seed data defining experience thresholds for each level.

- **Primary key:** `level` (INTEGER, > 0)
- **Key columns:**
  - `exp_required_total` — cumulative EXP needed to reach this level

**Seeding:** Level 1 has `exp_required_total = 0`. Current level is the greatest threshold not exceeding total EXP.

### `ai_reviews`

AI-generated reviews. Immutable except for archival.

- **Primary key:** `id` (AUTOINCREMENT)
- **Key columns:**
  - `user_id` — foreign key to `users`
  - `review_type` — 'daily', 'weekly', 'monthly', or 'yearly'
  - `period_start`, `period_end` — local dates defining the review scope
  - `review_text` — the generated review (non-empty)
  - `created_at` — UTC timestamp
  - `archived_at` — UTC timestamp if archived; otherwise NULL

**Index:** `(user_id, review_type, period_start, period_end)`

**Behavior:** Multiple reviews for the same period are allowed (user may regenerate and save alternatives). Reviews are only archivable, not deleted.

## Derived Metrics

**No writable streak or summary tables.** At local-app scale, source records are small enough to query directly. If profiling later justifies caches, they must be rebuildable projections with a single writer.

### Login Streak

- Count distinct ordered dates from `login_days`.
- If last login is today or yesterday, count backward through consecutive dates.
- If older than yesterday, current streak is zero.
- Best streak is the maximum historical consecutive-date run.

### Focus Streak

- Count distinct `focus_sessions.session_date` values (one session = one date).
- Apply same today/yesterday rule as login streak.
- Opening the app without completing a focus session does not affect it.

### Habit Streaks

- Read only `habit_completions` where `completed = 1`.
- Daily habit: consecutive local dates.
- Weekly habit: consecutive Monday-based ISO weeks.
- Current streak stays valid during the current open period; zero only after a full eligible period was missed.
- Unmarking recomputes current and best streaks (a corrected best may decrease).

### Flow Mode Consecutive Sessions

- Order focus sessions by `completed_at`.
- A session continues the chain if the gap from the previous session's `completed_at` to the next session's `started_at` is ≤ 4 hours.
- Crossing midnight does not break the chain.
- Flow Mode activates when the chain length reaches 4.

### Consistency

- **Login consistency:** distinct login dates / eligible calendar days since `tracking_start_date`.
- **Productive consistency:** distinct dates having either a completed focus session OR at least one completed daily habit / eligible calendar days.
- Weekly habits do not count as daily productive activity.
- Include weekends and holidays.
- Include today only after the user opens the app today.
- Clamp to 0–100; round for display only (do not store percentages).

### Level & Current EXP

- Total EXP: `SUM(amount)` from `exp_events`, clamped to 0 minimum.
- Current level: greatest `level_thresholds.level` where `exp_required_total ≤ total_exp`.
- Current-level EXP: total EXP minus that threshold's `exp_required_total`.

## Transactions and Atomicity

All multi-table feature operations run in a single transaction to maintain consistency:

1. **Focus session completion:** Insert `focus_sessions` row, insert positive `exp_events` row, commit.
2. **Habit toggle:** Upsert `habit_completions` row, insert `habit_completion_events` row, insert `exp_events` row (positive or negative), commit.
3. **App startup:** Upsert one `login_days` row in a single statement/transaction.
4. **Habit archival:** Update `archived` and `archived_at` together.

Foreign key constraints are enabled on every connection (`PRAGMA foreign_keys = ON`).

## Data Ownership by Feature

| Feature/Service | Writes | Reads |
|---|---|---|
| **App lifecycle** | `login_days` | `users` |
| **Focus Room** | `focus_sessions`, `exp_events` (atomic) | recent `focus_sessions`, `users` |
| **Habit Tracker** | `habits`, `habit_completions`, `habit_completion_events`, `exp_events` (atomic) | owned tables, `users` |
| **Progress/System** | seed `level_thresholds`; manual `exp_events` adjustments | all activity sources, `exp_events` |
| **Settings** | profile/preference columns in `users` only | `users` |
| **Dashboard** | none (read-only) | all source tables, derived metrics |
| **AI Review** | `ai_reviews` only | source activity tables, derived metrics, `users` |

**Rules:**
- Dashboard and AI Review are read-only consumers.
- Settings must never update progression (EXP, level, streaks, consistency).
- Feature writers may insert EXP events only as part of the transaction that creates or reverses their source activity.

## Timestamp Conventions

- All timestamps stored in database are UTC ISO-8601 text (`YYYY-MM-DDTHH:MM:SS.sssZ`).
- All dates (e.g., `session_date`, `login_date`, `period_start`) are local calendar dates (`YYYY-MM-DD`) derived from UTC timestamps in `users.time_zone` before insertion.
- The application is responsible for timezone conversion; SQLite cannot reliably derive IANA-zone local dates.
- Streaks and consistency calculations use local calendar dates, not rolling 24-hour windows.

## Idempotency and Retries

- `focus_sessions` and `exp_events` use `client_event_id` / `idempotency_key` to make writes idempotent.
- `habit_completion_events` uses `client_event_id`.
- If a write is retried with the same key, the database UNIQUE constraint prevents duplicate rows.

## Query File Organization

Accessor functions are organized by domain:

- `src/main/db/queries/profile.ts` — `getUser`, `ensureDefaultUser`, `updateUserProfile`
- `src/main/db/queries/focus.ts` — `insertFocusSession`, read helpers
- `src/main/db/queries/habits.ts` — `createHabit`, `getHabit`, `listHabits`, `archiveHabit`
- `src/main/db/queries/habitCompletions.ts` — `toggleHabitCompletion`, `listCompletedPeriods`
- `src/main/db/queries/login.ts` — `recordAppOpen`, `listLoginDates`
- `src/main/db/queries/reviews.ts` — `insertAiReview`, `getAiReview`, `listAiReviews`, `listAiReviewsForPeriod`, `archiveAiReview`
- `src/main/db/queries/exp.ts` — `insertExpEvent` (helper; called by other accessors)

Helpers:
- `src/main/db/constants.ts` — `DEFAULT_USER_ID`, EXP formula constants
- `src/main/db/dates.ts` — `todayLocalDate` (timezone-aware date derivation)
