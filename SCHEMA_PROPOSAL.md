# Task 6 Schema Proposal

**Status:** Awaiting developer + GPT-5.6 review and approval

---

## Overview

This schema supports:
- User profile & customization settings
- Focus sessions (Pomodoro history)
- Habits & daily completions
- EXP, level, and streak tracking (login, focus, per-habit)
- AI review storage (optional user saves)

**Key principles:**
- Immutable audit trail (no deletes, use soft deletes or archives)
- Date-based queries (YYYY-MM-DD for easy rollover logic)
- Normalized (avoid denormalization unless proven necessary)
- Separation of concerns (each feature owns its tables)

---

## Tables

### `users`
Stores user profile and app-wide settings.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'User',
  level INTEGER NOT NULL DEFAULT 1,
  exp_current INTEGER NOT NULL DEFAULT 0,
  exp_total INTEGER NOT NULL DEFAULT 0,
  accent_color TEXT DEFAULT '#8b5cf6',
  theme TEXT DEFAULT 'dark',
  profile_picture_path TEXT,
  background_image_path TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Notes:**
- Single row (id is fixed, e.g., 'default-user')
- EXP stored as integers (easier than floats)
- Paths are relative or absolute; empty = use defaults
- Updated_at tracks when settings last changed

---

### `login_streaks`
Tracks login consistency across days.

```sql
CREATE TABLE login_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date TEXT,
  consistency_percent INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Notes:**
- `current_streak`: Resets if user doesn't open app for 24h
- `consistency_percent`: (days with activity / total days) * 100
- Logic: Check `last_login_date` on app startup; if today != last, update streak

---

### `focus_sessions`
Immutable record of completed Pomodoro sessions.

```sql
CREATE TABLE focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  completed_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_focus_sessions_date ON focus_sessions(session_date);
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
```

**Notes:**
- `session_date`: YYYY-MM-DD, extracted from completed_at for easy daily aggregation
- Append-only; no deletes
- Durations stored in minutes (e.g., 25 for standard Pomodoro)
- Used for: EXP calculation, streak tracking, dashboard stats

---

### `focus_streaks`
Tracks consecutive focus days and session streaks.

```sql
CREATE TABLE focus_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  consecutive_sessions INTEGER NOT NULL DEFAULT 0,
  last_session_date TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Notes:**
- `current_streak`: Consecutive days with ≥1 session (resets if day skipped)
- `consecutive_sessions`: Unbroken count (for Flow Mode after 4)
- Flow Mode activates when `consecutive_sessions >= 4`
- Logic: Update on session completion; reset `consecutive_sessions` if gap > some threshold (e.g., 4 hours between sessions)

---

### `habits`
Habit definitions (e.g., "Morning Meditation", "Exercise").

```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_habits_user ON habits(user_id);
```

**Notes:**
- `id`: Generated (e.g., UUID or prefixed like 'h_' + random)
- `frequency`: 'daily' or 'weekly' (used for reset logic)
- `archived`: 0 = active, 1 = archived (soft delete)
- No deletion; archive instead

---

### `habit_completions`
Daily (or per-frequency) completion log.

```sql
CREATE TABLE habit_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  completed INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, completion_date),
  FOREIGN KEY (habit_id) REFERENCES habits(id)
);

CREATE INDEX idx_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_completions_habit ON habit_completions(habit_id);
```

**Notes:**
- `completion_date`: YYYY-MM-DD
- `completed`: 1 = yes, 0 = no
- One row per habit per day (for daily) or per week (for weekly)
- Append-only updates (set `updated_at` on toggle)

---

### `habit_streaks`
Per-habit streak tracking.

```sql
CREATE TABLE habit_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_completion_date TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id)
);
```

**Notes:**
- `current_streak`: Consecutive days completed (resets on miss)
- Logic: Query `habit_completions` for consecutive days before today; if today not completed, reset to 0
- Updated on each completion toggle

---

### `ai_reviews` (Optional)
User-saved AI reviews.

```sql
CREATE TABLE ai_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  review_type TEXT NOT NULL CHECK(review_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  review_text TEXT NOT NULL,
  saved INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_reviews_user ON ai_reviews(user_id);
CREATE INDEX idx_reviews_period ON ai_reviews(period_start, period_end);
```

**Notes:**
- `period_start`, `period_end`: YYYY-MM-DD
- `saved`: 1 = user kept it, 0 = marked for deletion (or can hard delete)
- Append-only; reviews are immutable once created

---

## Data Ownership

| Feature | Owns | Reads |
|---------|------|-------|
| **Focus Room** | focus_sessions, focus_streaks | focus_streaks (for UI display) |
| **Habit Tracker** | habits, habit_completions, habit_streaks | All three |
| **Dashboard** | login_streaks (aggregates) | users, focus_streaks, habit_streaks, login_streaks |
| **Settings** | users (profile/settings columns) | users |
| **AI Review** | ai_reviews | focus_sessions, habit_completions, users, focus_streaks, habit_streaks |

---

## Edge Cases & Assumptions

### Date Rollover
- App checks date on startup
- If `last_login_date` ≠ today, increment/reset streaks as needed
- Focus sessions use `session_date` (from `completed_at`) for consistent daily bucketing

### Streak Logic
- **Login streak:** Increments if user opens app (even once)
- **Focus streak:** Increments if user completes ≥1 session that day
- **Habit streak:** Increments if habit marked complete that day
- All reset to 0 if a day is skipped (no session/completion)
- Best streaks never decrement (historical max)

### Flow Mode
- Activates when `focus_streaks.consecutive_sessions >= 4`
- Resets to 0 on any missed session or gap > X hours between sessions
- Visual: Subtle blue glow (CSS), no behavior change

### Consistency Score
- Calculated: (days_with_any_activity / total_days_since_created) * 100
- Used for dashboard motivation display
- Recalculated on each login or session completion

### Soft Deletes
- Habits: Use `archived` flag instead of DELETE
- AI Reviews: Use `saved` flag instead of DELETE
- Reason: Preserve audit trail and historical data

---

## Migration Strategy (Future)

If schema changes in Task 7+:
1. Add new columns with DEFAULT values
2. Add new tables
3. Mark old columns as deprecated (via comment)
4. No dropping or renaming in MVP

Example (not needed now):
```sql
ALTER TABLE users ADD COLUMN notification_enabled INTEGER DEFAULT 1;
```

---

## Questions for Developer Review

1. **EXP formula:** How much EXP per minute of focus? Per habit completion? Should we store in table or calculate?
2. **Streak gap threshold:** If user completes sessions at 11pm and 1am (next day), should that count as consecutive or reset?
3. **Habit frequency:** Do "weekly" habits need special reset logic (Sunday rollover)?
4. **Best streaks:** Should they update in real-time or only on reset?
5. **Consistency calculation:** Should it include weekends/holidays, or only actual calendar days?

---

## File Structure After Approval

```
src/main/db/
├── schema.sql (this file, compiled to DB on first launch)
├── db.ts (initialization, connection, migrations)
└── queries/
    ├── profile.ts (users table CRUD)
    ├── focusSessions.ts (focus_sessions, focus_streaks)
    ├── habits.ts (habits, completions, streaks)
    ├── progress.ts (EXP, levels, login_streaks)
    └── aiReviews.ts (reviews storage)
```

---

## Summary

- **8 tables** covering all MVP features
- **Clear data ownership** (no ambiguity)
- **Append-only core data** (sessions, completions)
- **Updatable state** (streaks, settings)
- **Ready for Tasks 7-11** without rework
- **No migrations needed** for foreseeable changes

Ready for review and approval.
