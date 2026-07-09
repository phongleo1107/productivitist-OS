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
