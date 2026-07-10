# Task 6 Revised Schema Proposal

**Status:** Approved design after schema review

## Decisions

- SQLite stores timestamps as canonical UTC ISO-8601 text (`YYYY-MM-DDTHH:MM:SS.sssZ`).
- Calendar dates and periods are calculated in `users.time_zone` before being written.
- Login, focus, habit, EXP, and review history are source-of-truth records.
- Streaks, consistency percentages, level, and current EXP are derived values, not independently writable state.
- Daily streaks use local calendar dates, not rolling 24-hour windows.
- Weekly habits use Monday-based ISO weeks for MVP.
- Archived habits remain available to historical Dashboard and AI queries and cannot be reactivated in MVP.
- All multi-table feature operations run in one transaction.

Applications must enable foreign keys on every connection:

```sql
PRAGMA foreign_keys = ON;
```

## Schema

### `users`

Single-user profile, display settings, and calendar preferences. Progression does not live in this table.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'User' CHECK (length(trim(name)) > 0),
  accent_color TEXT NOT NULL DEFAULT '#8b5cf6',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  profile_picture_path TEXT,
  background_image_path TEXT,
  time_zone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  week_starts_on INTEGER NOT NULL DEFAULT 1 CHECK (week_starts_on BETWEEN 0 AND 6),
  tracking_start_date TEXT NOT NULL
    CHECK (date(tracking_start_date) IS NOT NULL AND date(tracking_start_date) = tracking_start_date),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

`time_zone` is an IANA zone name. `week_starts_on` uses 0 = Sunday through 6 = Saturday; MVP writes 1. The app supplies all timestamps and dates because SQLite cannot reliably derive an IANA-zone local date.

### `login_days`

One row proves that the user opened the app on a particular local calendar day.

```sql
CREATE TABLE login_days (
  user_id TEXT NOT NULL,
  login_date TEXT NOT NULL
    CHECK (date(login_date) IS NOT NULL AND date(login_date) = login_date),
  first_opened_at TEXT NOT NULL,
  last_opened_at TEXT NOT NULL,
  open_count INTEGER NOT NULL DEFAULT 1 CHECK (open_count > 0),
  PRIMARY KEY (user_id, login_date),
  CHECK (last_opened_at >= first_opened_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
```

On startup, upsert today's row: increment `open_count` and update `last_opened_at`. This affects login streak only.

### `focus_sessions`

Immutable record of completed focus sessions. Abandoned or in-progress timers are not stored here.

```sql
CREATE TABLE focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_event_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  session_date TEXT NOT NULL
    CHECK (date(session_date) IS NOT NULL AND date(session_date) = session_date),
  planned_duration_minutes INTEGER NOT NULL CHECK (planned_duration_minutes > 0),
  actual_duration_seconds INTEGER NOT NULL CHECK (actual_duration_seconds > 0),
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (completed_at >= started_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_focus_sessions_user_date
  ON focus_sessions(user_id, session_date);

CREATE INDEX idx_focus_sessions_user_completed
  ON focus_sessions(user_id, completed_at);
```

`session_date` is the local date of `completed_at` in the user's timezone at completion time. `client_event_id` makes retries idempotent.

### `habits`

Habit definitions. Archiving is permanent in MVP; recreating a habit creates a new ID.

```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  created_date TEXT NOT NULL
    CHECK (date(created_date) IS NOT NULL AND date(created_date) = created_date),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  archived_at TEXT,
  CHECK (
    (archived = 0 AND archived_at IS NULL) OR
    (archived = 1 AND archived_at IS NOT NULL)
  ),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_habits_user_archived
  ON habits(user_id, archived);
```

Changing `frequency` after a habit has completions is not allowed in MVP because it would reinterpret its streak history.

### `habit_completions`

Current completion truth for one habit period. A row may be toggled between complete and incomplete.

```sql
CREATE TABLE habit_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  period_start TEXT NOT NULL
    CHECK (date(period_start) IS NOT NULL AND date(period_start) = period_start),
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (habit_id, period_start),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE RESTRICT
);

CREATE INDEX idx_habit_completions_period
  ON habit_completions(period_start, completed);
```

For a daily habit, `period_start` is that local date. For a weekly habit, it is the Monday starting its ISO week. The application verifies that `period_type` equals the habit's immutable `frequency`. A toggle increments `revision` and updates `updated_at`.

### `habit_completion_events`

Append-only audit trail for habit mark/unmark operations. This permits repair, conflict resolution, and correct EXP reversals.

```sql
CREATE TABLE habit_completion_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_event_id TEXT NOT NULL UNIQUE,
  completion_id INTEGER NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
  occurred_at TEXT NOT NULL,
  UNIQUE (completion_id, revision),
  FOREIGN KEY (completion_id) REFERENCES habit_completions(id) ON DELETE RESTRICT
);
```

The current-state row and its event are written in the same transaction.

### `exp_events`

Append-only EXP ledger. Negative entries reverse awards; rows are never updated or deleted.

```sql
CREATE TABLE exp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('focus_session', 'habit_completion', 'adjustment')),
  source_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  formula_version INTEGER NOT NULL CHECK (formula_version > 0),
  reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_exp_events_user_created
  ON exp_events(user_id, created_at);

CREATE INDEX idx_exp_events_source
  ON exp_events(source_type, source_id);
```

`source_id` is the focus session ID or habit completion event ID. The idempotency key prevents duplicate awards on retries. Total EXP is `MAX(0, SUM(amount))`.

### `level_thresholds`

Versioned application seed data defining level boundaries.

```sql
CREATE TABLE level_thresholds (
  level INTEGER PRIMARY KEY CHECK (level > 0),
  exp_required_total INTEGER NOT NULL UNIQUE CHECK (exp_required_total >= 0)
);
```

Level 1 must have `exp_required_total = 0`. Current level is the greatest threshold not exceeding total EXP. Current-level EXP is total EXP minus that threshold.

### `ai_reviews`

Saved AI-generated reviews. Reviews are immutable except for archival.

```sql
CREATE TABLE ai_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  review_type TEXT NOT NULL
    CHECK (review_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start TEXT NOT NULL
    CHECK (date(period_start) IS NOT NULL AND date(period_start) = period_start),
  period_end TEXT NOT NULL
    CHECK (date(period_end) IS NOT NULL AND date(period_end) = period_end),
  review_text TEXT NOT NULL CHECK (length(trim(review_text)) > 0),
  created_at TEXT NOT NULL,
  archived_at TEXT,
  CHECK (period_end >= period_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ai_reviews_user_period
  ON ai_reviews(user_id, review_type, period_start, period_end);
```

Multiple reviews for the same period are allowed because the user may regenerate and save alternatives.

## Derived Metrics Contract

There are no writable streak tables. At local-app scale, indexed source records are small enough to query directly. If profiling later justifies caches, they must be rebuildable projections and have a single writer.

### Login streak

- Use distinct ordered dates from `login_days`.
- Opening multiple times on one date counts once.
- If the last login is today or yesterday, count backward through consecutive dates.
- If it is older than yesterday, current streak is zero.
- Best streak is the maximum historical consecutive-date run.

### Focus streak

- Use distinct `focus_sessions.session_date` values.
- At least one completed session makes that date active.
- Apply the same today/yesterday rule as login streak.
- Opening the app without completing a focus session does not affect it.

### Flow Mode consecutive sessions

- Order focus sessions by `completed_at`.
- A session continues the chain when the elapsed gap from the previous session's `completed_at` to the next session's `started_at` is at most four hours.
- Crossing midnight does not break the chain.
- Flow Mode activates at a chain length of four.

### Habit streaks

- Read only `habit_completions.completed = 1`.
- Daily streak units are consecutive local dates.
- Weekly streak units are consecutive Monday-based ISO week starts.
- The current streak stays valid during the current open period; it is zero only after a full eligible period was missed.
- Unmarking recomputes current and best streaks, so a corrected historical best may decrease.
- An archived habit retains historical streak data but no longer accumulates periods.

### Consistency

- **Login consistency:** distinct login days divided by eligible local calendar days since `tracking_start_date`.
- **Productive consistency:** distinct dates having either a completed focus session or at least one completed daily habit, divided by eligible local calendar days.
- Weekly habit completions do not count as daily productive activity because assigning a weekly completion to one day would distort the metric.
- Include weekends and holidays in MVP.
- Include today in the denominator only after the user opens the app today.
- Clamp percentages to 0–100 and round only for display; do not persist the percentage.

### EXP and levels

- Focus EXP: one EXP per completed focus minute, using `floor(actual_duration_seconds / 60)` with a minimum award of one EXP.
- Habit EXP: 10 EXP when a daily or weekly period becomes complete.
- Unmarking a habit writes a matching `-10` EXP event; re-marking writes a new `+10` event.
- Each award records `formula_version = 1`, so future formulas do not rewrite history.
- Total EXP, level, and current-level EXP are derived from `exp_events` plus `level_thresholds`.

## Data Ownership

| Feature/service | Writes | Reads |
|---|---|---|
| App lifecycle | `login_days` | `users` |
| Focus Room | `focus_sessions`; corresponding `exp_events` in one transaction | recent `focus_sessions`, `users` |
| Habit Tracker | `habits`, `habit_completions`, `habit_completion_events`; corresponding `exp_events` in one transaction | its owned tables, `users` |
| Progress service | seed `level_thresholds`; manual `exp_events` adjustments | all activity sources and `exp_events` |
| Settings | profile/preference columns in `users` only | `users` |
| Dashboard | none | all source tables and derived metrics |
| AI Review | `ai_reviews` only | source activity tables, derived metrics, `users` |

Dashboard and AI Review are read-only consumers. Settings must never update progression. Feature writers may insert EXP events only as part of the transaction that creates or reverses their source activity.

## Required Transaction Boundaries

1. Focus completion: insert `focus_sessions`, then its positive `exp_events` row, then commit.
2. Habit toggle: upsert `habit_completions`, insert `habit_completion_events`, insert the positive or negative `exp_events` row, then commit.
3. App open: upsert `login_days` in one statement/transaction.
4. Habit archive: update `archived` and `archived_at` together.

## Answers to Developer Clarification Questions

1. **EXP formula:** Use one EXP per completed focus minute with a minimum of one, and 10 EXP per completed habit period. Store every actual award/reversal in `exp_events` with a formula version; do not calculate historical EXP from the current formula.
2. **Streak gap threshold:** A session at 11 PM and another at 1 AM count as consecutive focus days and as consecutive Flow sessions because the gap is under four hours. Calendar streak and Flow-session chain are separate calculations.
3. **Weekly habit frequency:** Weekly habits use Monday-based ISO weeks for MVP. They have one completion row per week and streaks advance in week-sized units; no Sunday reset.
4. **Best streak updates:** Compute/update the displayed best immediately. Because completions can be unmarked, recomputation may reduce a previously displayed best that was based on corrected data.
5. **Consistency calculation:** Include weekends and holidays. Provide separate login and productive consistency metrics, calculate from source rows, and do not store percentages.

## Edge-case Acceptance Criteria

- Opening the app with no completed focus session increments login streak only.
- Sessions completed at 11:50 PM and 12:10 AM occupy adjacent local dates and advance a daily focus streak; they also remain in the same Flow chain when the gap is within four hours.
- Marking then unmarking a habit leaves its period incomplete, records both audit events, reverses EXP, and recomputes current/best streaks.
- Archiving a habit hides it from active lists without deleting completions, audit events, EXP events, Dashboard history, or AI history.
- A crash or migration cannot permanently corrupt streaks, consistency, level, or EXP because each can be rebuilt from source tables.

## Migration and Performance Notes

- Use numbered migrations from the first release; do not depend only on first-launch schema creation.
- Run `PRAGMA integrity_check` in diagnostics and keep foreign keys enabled.
- The composite indexes above cover primary Dashboard, streak, and AI period queries.
- Streak scans are bounded by the user's local history and should be inexpensive for MVP. Add rebuildable summary tables only after measuring a real slowdown.
- Date validity beyond SQLite's date parsing, IANA timezone validity, timestamp canonicalization, and matching habit frequency/period type are application-layer validations.

## Approval

This revised schema is approved for Tasks 7–11 provided implementation follows the timezone, derivation, idempotency, and transaction contracts above.

**Confidence: 4/5.** The remaining risk is implementation correctness around timezone conversion and atomic habit/EXP toggles, not a known structural gap.
