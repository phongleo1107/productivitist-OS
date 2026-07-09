# Architecture

## Architecture Goals

- Local-first and offline-first by default.
- Desktop-first MVP.
- Modular enough to add features incrementally.
- Simple enough for Claude Code to change one task at a time.
- Private by default, with no required account or cloud service.

## Approved Stack

The approved stack (see Decision 008) is:

- Electron for desktop shell, scaffolded with electron-vite
- React for UI
- TypeScript for application code
- SQLite for local structured data (added in Task 6)
- Ollama for local AI reviews (added in Task 10)

The scaffold uses electron-vite's main/preload/renderer structure:

- `src/main/` — Electron main process
- `src/preload/` — context-isolated preload bridge
- `src/renderer/` — React UI

## Application Shape

Use a modular feature structure once implementation begins:

- Dashboard
- Focus Room
- Habit Tracker
- AI Review
- Settings and customization
- Shared UI components
- Local persistence

Each feature should own its UI and behavior where possible. Shared code should be introduced only when duplication becomes meaningful.

## Data Ownership

All user data is local by default.

Expected local storage responsibilities:

- Store profile and customization settings.
- Store focus sessions and Pomodoro completion history.
- Store habit definitions and completion history.
- Store EXP, level, streak, and consistency state.
- Store generated AI review history if the user chooses to keep it.

Do not add cloud sync, remote databases, authentication, or telemetry during the MVP.

## AI Review Architecture

The AI Review feature calls a local Ollama model with structured summaries of tracked user data.

**Important:** Ollama must be installed and running locally on the user's machine. The app does NOT fall back to cloud LLMs. If Ollama is unavailable, gracefully inform the user.

The app should:

- Format only the relevant local data for the requested review period.
- Keep prompts focused on productivity review.
- Avoid sending unnecessary personal data.
- Ask for clarification when required data is missing.
- Keep review output concise and actionable.

## Integration Boundaries

### Spotify

Spotify support should be treated as an integration entry point during early MVP work. Do not make Spotify required for the Focus Room to function.

### Local Music

Local music support is future-ready only. Keep the Focus Room design flexible, but do not implement local music until explicitly tasked.

## Future Flexibility

The architecture should not block later additions such as a skill tree, plugin system, analytics dashboard, calendar integration, achievements, session timeline, or AI study companion.

Do not build abstractions for these features before they are needed.

## Documentation Rule

Any architectural decision that changes the app structure, data ownership, persistence strategy, integration approach, or AI behavior must be recorded in `docs/DECISIONS.md`.
