# Implementation Tasks

## Model Policy

- Small documentation updates: Haiku
- Small UI changes: Haiku
- Normal implementation: Fable 5
- Refactoring: Fable 5
- Complex reasoning or architectural work: Opus only when truly necessary

Prefer Fable 5 whenever possible.

## Task 1: Documentation Foundation Review

**Objective:** Verify the project documentation is complete, consistent, and ready for implementation planning.

**Description:** Review all Markdown documentation for contradictions, missing constraints, and unclear instructions. Update only documentation if issues are found.

**Dependencies:** None.

**Expected files to modify:**

- `CLAUDE.md`
- `CURRENT_TASK.md`
- `docs/*.md`

**Acceptance criteria:**

- All required documentation files exist.
- Claude Code rules are clear and complete.
- Non-goals are consistently stated.
- No application code is added.

**Suggested Claude model:** Haiku

## Task 2: Project Scaffold

**Objective:** Create the initial desktop app structure after developer approval.

**Description:** Scaffold the approved stack with minimal configuration. Do not implement product features.

**Dependencies:** Task 1 and developer approval of the stack.

**Expected files to modify:**

- Project configuration files
- Source directory structure
- Basic app entry files

**Acceptance criteria:**

- App can start with a minimal placeholder screen.
- No MVP features are implemented.
- No unapproved dependencies are added.
- Documentation is updated if the approved stack differs from the provisional stack.

**Suggested Claude model:** Fable 5

## Task 3: Static Dashboard UI

**Objective:** Build the dashboard shell with mock data only.

**Description:** Create the home dashboard layout showing profile, level, EXP, consistency score, streak, weekly activity, daily focus stats, and quick access cards.

**Dependencies:** Task 2.

**Expected files to modify:**

- Dashboard feature files
- Shared UI components if needed
- Styling files

**Acceptance criteria:**

- Dashboard matches the design direction.
- No location is displayed.
- Data is static or mocked.
- No persistence or feature behavior is added.

**Suggested Claude model:** Fable 5

## Task 4: Static Focus Room UI

**Objective:** Build the Focus Room visual shell without integrations.

**Description:** Create the Pomodoro timer layout, music area, ambient selector, background selector, session stats, focus streak, and today's focused time using mock data.

**Dependencies:** Task 2.

**Expected files to modify:**

- Focus Room feature files
- Shared UI components if needed
- Styling files

**Acceptance criteria:**

- Focus Room feels calm and immersive.
- Timer is present but does not need full behavior.
- Spotify and local music are represented only as UI entry points.
- Local music UI is designed to be flexible but does not include implementation (future task).
- No external integration is added.

**Suggested Claude model:** Fable 5

## Task 5: Static Habit Tracker UI

**Objective:** Build the Habit Tracker shell with mock data.

**Description:** Create daily habits, weekly overview, contribution grid, streak display, and completion history UI.

**Dependencies:** Task 2.

**Expected files to modify:**

- Habit Tracker feature files
- Shared UI components if needed
- Styling files

**Acceptance criteria:**

- Habit completion controls appear low-friction.
- Contribution grid is readable.
- Data is static or mocked.
- No persistence is added.

**Suggested Claude model:** Fable 5

## Task 6: Local Persistence Foundation

**Objective:** Add local data persistence after schema approval.

**Description:** Implement the approved local storage approach for profile settings, focus sessions, habits, completions, EXP, streaks, and review history.

**Dependencies:** Tasks 2-5 and developer approval of the data model.

**Expected files to modify:**

- Persistence layer files
- Data model files
- Architecture documentation
- Decision log

**Acceptance criteria:**

- Data remains fully local.
- Schema or storage shape is documented.
- No cloud, auth, telemetry, or online database is introduced.
- Existing static UI remains functional.

**Suggested Claude model:** Fable 5

## Task 7: Pomodoro Timer Behavior

**Objective:** Implement Focus Room timer behavior and focus-session completion.

**Description:** Add Pomodoro start, pause, reset, completion, session stats, EXP award hooks, consecutive session tracking, and Flow Mode activation after four completed sessions.

**Dependencies:** Task 6.

**Expected files to modify:**

- Focus Room feature files
- Persistence layer files
- EXP or progress files
- Tests if available

**Acceptance criteria:**

- Completed sessions are saved locally.
- Longer sessions award more EXP.
- Consecutive sessions provide a small bonus.
- Flow Mode activates after four consecutive completed Pomodoro sessions.
- Flow Mode is visually subtle.

**Suggested Claude model:** Fable 5

## Task 8: Habit Completion Behavior

**Objective:** Implement habit completion, streaks, history, and EXP awards.

**Description:** Connect the Habit Tracker UI to local persistence and make habit completion fast and reversible if appropriate.

**Dependencies:** Task 6.

**Expected files to modify:**

- Habit Tracker feature files
- Persistence layer files
- EXP or progress files
- Tests if available

**Acceptance criteria:**

- Habit completions are saved locally.
- Habit streaks update correctly.
- Contribution grid reflects completion history.
- Completed habits award EXP.
- Completion requires minimal interaction.

**Suggested Claude model:** Fable 5

## Task 9: Dashboard Data Integration

**Objective:** Replace dashboard mock data with local aggregates.

**Description:** Connect the dashboard to local focus, habit, EXP, streak, and consistency data.

**Dependencies:** Tasks 7 and 8.

**Expected files to modify:**

- Dashboard feature files
- Local query or selector files
- Tests if available

**Acceptance criteria:**

- Dashboard reflects saved local data.
- Weekly activity and daily focus stats are accurate.
- No location is displayed.
- Empty states are calm and useful.

**Suggested Claude model:** Fable 5

## Task 10: Ollama Review MVP

**Objective:** Generate local AI productivity reviews from tracked data.

**Description:** Add daily, weekly, monthly, and yearly review generation using a local Ollama model and structured local data summaries.

**Prerequisite:** Ollama must be installed and running locally on the developer's machine before this task begins. The app assumes Ollama is available at the default localhost connection. If unavailable, the app should gracefully inform the user instead of falling back to cloud LLMs.

**Dependencies:** Tasks 6-9.

**Expected files to modify:**

- AI Review feature files
- Ollama integration files
- Prompt or review formatting files
- AI documentation if behavior changes

**Acceptance criteria:**

- Reviews use only available local data.
- Reviews include progress, accomplishments, improvement areas, habit consistency, focus trends, suggestions, and next steps.
- Output is concise and actionable.
- The AI does not drift into unrelated conversation.
- Missing data is handled honestly.

**Suggested Claude model:** Fable 5

## Task 11: Customization Settings

**Objective:** Allow users to customize the app experience.

**Description:** Add settings for background image, profile picture, primary accent color, and theme.

**Dependencies:** Tasks 3, 4, and 6.

**Expected files to modify:**

- Settings feature files
- Theme or style files
- Persistence layer files
- Design documentation if behavior changes

**Acceptance criteria:**

- Customization persists locally.
- Dashboard and Focus Room reflect relevant preferences.
- Defaults remain polished.
- No online account is required.

**Suggested Claude model:** Fable 5

## Task 12: Refactor and Polish Pass

**Objective:** Improve maintainability after core flows work.

**Description:** Clean up duplication, improve naming, tighten UI details, and add missing tests only after the main MVP flows are functional.

**Dependencies:** Tasks 1-11.

**Expected files to modify:**

- Existing feature files
- Shared utilities or components
- Tests
- Documentation if behavior changes

**Acceptance criteria:**

- No unrelated behavior changes are introduced.
- Refactors are small and explainable.
- UI remains consistent with the design system.
- Relevant checks pass.

**Suggested Claude model:** Fable 5
