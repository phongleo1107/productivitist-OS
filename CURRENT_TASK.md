# Current Task

Task 3: Static Dashboard UI (from `docs/TASKS.md`).

## Goal

Build the home dashboard shell with mock data only: user profile, level and EXP, consistency score, current streak, weekly activity, daily focus stats, and quick access cards for Focus Room, Habit Tracker, AI Review, and Settings. No persistence and no feature behavior.

Task 2 (Project Scaffold) was approved by the developer on 2026-07-09.

## Allowed To Change

- `src/renderer/src/features/dashboard/` (new dashboard feature files)
- `src/renderer/src/App.tsx` (mount the dashboard)
- `src/renderer/src/assets/` (shared styling and design tokens)
- Shared UI components under `src/renderer/src/` only if duplication becomes meaningful
- `CLAUDE.md` (Project Status and Task 2 Review Status sections only, to record the task transition)
- `src/main/index.ts` (window dimensions only — developer-requested desktop-only layout, 2026-07-09; `webPreferences` and link handling untouched)
- This file

## Do Not Touch

- `src/main/` and `src/preload/` (a static UI needs no main/preload changes)
- Focus Room, Habit Tracker, AI Review, and Settings feature implementations
- Database schema or persistence
- Spotify or Ollama integration
- Git history
- `docs/PRD.md`, `docs/TASKS.md`, `docs/AI_RULES.md`, `docs/DESIGN_SYSTEM.md`

## Requirements

- Dashboard matches the developer-provided reference mockup (2026-07-09): gamer-profile header with avatar and display name, level/rank card with EXP bar, immersive hero banner with quote, online status card, login-streak contribution grid, three feature cards (Focus Room, Habit Tracker, AI Review) with mock stats, and a utility footer bar.
- Core design-system principles still apply (dark-first, purple accent, compact cards, readable contrast). The mockup's neon-glow styling goes beyond the "avoid excessive glow" guidance in `docs/DESIGN_SYSTEM.md`; glow is kept restrained, and updating that protected doc needs separate developer approval.
- No location is displayed anywhere (explicitly reconfirmed by the developer for the mockup rebuild).
- Third round (developer feedback, 2026-07-09): descriptive text removed from every element (profile tagline, hero subtitle lines, feature-card blurbs, footer quote); the hero banner quote is the only quote kept and rotates from a local pool on each app launch (developer-requested exception to "no behavior"); hero artwork proportions reworked.
- Fourth round (developer feedback, 2026-07-09): dashboard is desktop-only — the responsive single-column collapse was removed and the main window opens at 1440x900 with a 1200x760 minimum; the role/join-date indicators under the profile name were removed; the hero banner artwork and profile picture stay as isolated placeholder components (`artwork.tsx`) so Task 11 customization can swap them for user-provided images.
- All data is static or mocked.
- Quick access cards are visual entry points only; navigation and feature behavior arrive in later tasks.
- No new dependencies.

## Completion Checklist

- [x] Relevant documentation was read.
- [x] Only approved files were changed.
- [x] Relevant checks were run or skipped with explanation.
- [x] Changed files were summarized.
- [x] Manual review is ready.
- [x] Next task was suggested but not started.

## Review Status

Fourth implementation round applied on 2026-07-09; awaiting manual developer review.

Round history: (1) initial static dashboard built and reviewed; (2) rebuilt against the developer-provided reference mockup, location excluded; (3) developer feedback applied — descriptive text removed from every element, hero quote rotates from a local pool on each app launch, hero artwork proportions reworked; (4) desktop-only layout enforced via window sizing, profile meta indicators removed, banner/profile picture kept swappable for Task 11.

Automated adversarial review fixes applied before handoff: WCAG AA contrast for small text and accent-on-soft-purple text (tokens `--color-text-faint`, `--color-accent-text` in `src/renderer/src/assets/main.css`); deterministic `en-US` EXP number formatting; streak month/day labels aligned to their actual grid columns/rows; trend arrows given screen-reader text; unused `--color-neon-pink` token removed. The PRD-required consistency score was missing from the reference mockup; the developer chose (2026-07-09) to add it as a compact mock stat in the Login Streak card. Pre-existing note: `README.md` (untouched by this task) is not Prettier-formatted.

## Notes

Mock data lives inside the dashboard feature so Task 9 (Dashboard Data Integration) can replace it in one place. Persistence arrives in Task 6.
