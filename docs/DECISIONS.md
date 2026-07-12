# Decision Log

Record project decisions here when they affect architecture, data ownership, feature scope, AI behavior, or development workflow.

## 001: Local-First By Default

**Decision:** All user data remains local by default.

**Reason:** Privacy, offline access, low setup, and user trust are core project principles.

**Impact:** Do not add cloud sync, online databases, telemetry, or required accounts during the MVP.

## 002: Desktop-First MVP

**Decision:** The MVP targets desktop only.

**Reason:** The product is designed around deep work, persistent focus sessions, and a high-density dashboard.

**Impact:** Mobile support is out of scope for the MVP.

## 003: Documentation-First Development

**Decision:** Claude Code must read project documentation before implementation work.

**Reason:** The project should be developed incrementally with clear constraints.

**Impact:** `CLAUDE.md`, `CURRENT_TASK.md`, and `docs/` define the working process.

## 004: One Task At A Time

**Decision:** Claude Code may complete only the active task in `CURRENT_TASK.md`.

**Reason:** Small tasks reduce accidental scope expansion and make manual review easier.

**Impact:** Claude Code must not automatically continue to the next task.

## 005: Manual Review And Git Control

**Decision:** Every implementation requires manual developer review, and every Git commit must be performed manually by the developer.

**Reason:** The developer remains in control of project history and approval.

**Impact:** Claude Code must not commit, push, merge, rebase, or assume approval.

## 006: Provisional Stack Pending Approval

**Decision:** Electron, React, TypeScript, SQLite, and Ollama are the provisional stack.

**Reason:** This stack fits the local-first, desktop-first, AI-enabled product direction.

**Impact:** The stack must be confirmed before project scaffolding. If changed, update `docs/ARCHITECTURE.md` and this decision log.

## 007: No Auth, Cloud, Social, Or Mobile MVP

**Decision:** Authentication, cloud sync, social features, leaderboards, online databases, team collaboration, complex RPG mechanics, and mobile support are excluded from the MVP.

**Reason:** The app should remain lightweight, private, and focused on individual productivity.

**Impact:** These features should not appear in implementation tasks unless the developer explicitly changes scope.

## 008: Stack Approved And Scaffolded With electron-vite

**Decision:** The developer approved the provisional stack (Electron, React, TypeScript, with SQLite planned for Task 6 and Ollama for Task 10) on 2026-07-09. The project was scaffolded with electron-vite (react-ts template).

**Reason:** electron-vite provides a purpose-built main/preload/renderer structure with fast development builds and minimal configuration, matching the "simple enough to change one task at a time" architecture goal.

**Impact:** The stack is no longer provisional. Scaffold tooling (electron-vite, electron-builder, ESLint, Prettier) and template dependencies are approved. SQLite and Ollama libraries are still not installed; they arrive with their tasks.

## 009: SQLite Persistence Schema (Task 6)

**Decision:** The persistence layer uses SQLite with the schema approved in `SCHEMA_PROPOSAL.md`. Key design choices:

- **Storage format:** SQLite single-file database with numbered migrations.
- **Timestamps:** All stored as canonical UTC ISO-8601 text; local dates are derived from UTC timestamps in the user's configured timezone before insertion.
- **Streaks and metrics:** Calculated at read time from source tables, not stored in denormalized tables. No streak tables; no summary caches required for MVP.
- **EXP ledger:** Append-only immutable log with formula versioning. Each focus minute yields 1 EXP (min 1); each habit completion yields 10 EXP. Unmarking habits writes negative EXP to reverse awards.
- **Transactions:** Multi-table operations (focus completion, habit toggle, app startup, archival) run atomically with foreign key constraints enabled.
- **Idempotency:** Focus sessions and EXP events use `client_event_id` / `idempotency_key` to allow safe retries.

**Reason:**

- SQLite is lightweight, requires no external service, and suits local-first development.
- UTC storage + timezone-aware derivation avoids daylight-saving bugs and clock-skew issues.
- Derived metrics simplify the schema, eliminate stale-cache bugs, and keep aggregations correct by construction (they rebuild from source on every read).
- Append-only EXP log enables audit trails, corrects reversals without recalculation, and lets future formulas coexist with historical data.
- Atomic transactions prevent inconsistencies between feature state and progression (EXP, level, streaks).

**Impact:**

- Persistence is fully local; no cloud or sync mechanism.
- The schema is owned by `src/main/db/schema.sql` and migrations in `src/main/db/migrations/`.
- Query accessors live in `src/main/db/queries/` (profile, focus, habits, habit completions, login, reviews, EXP).
- The renderer accesses the database through a narrow IPC bridge (`window.api.db.*` in `src/preload/index.ts`).
- Tasks 7–11 wire feature UIs to these accessors without modifying the schema or preload API.
- If profiling later shows a real performance bottleneck in deriving metrics (e.g., large historical datasets), caches may be added as rebuildable materialized views, but not in MVP.

**Confidence:** 4/5 (schema is sound; implementation risk centers on timezone handling and atomic habit/EXP toggles, which were validated in Task 6).
