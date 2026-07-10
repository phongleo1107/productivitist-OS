-- Canonical schema reference for Productivitist OS local persistence.
-- Source of truth: SCHEMA_PROPOSAL.md (approved 2026-07-10).
-- This file documents the full schema; the database is actually built by
-- applying the numbered migrations in ./migrations in order (see db.ts).
-- Keep this file and migrations/001_init.sql in sync.

PRAGMA foreign_keys = ON;

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

CREATE TABLE level_thresholds (
  level INTEGER PRIMARY KEY CHECK (level > 0),
  exp_required_total INTEGER NOT NULL UNIQUE CHECK (exp_required_total >= 0)
);

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
