# Product Requirements Document

## Product Summary

Build a local-first, AI-powered productivity tracker for desktop users who want to develop consistent deep work habits. The app combines Notion-like simplicity, Steam-like dark visual style, and lightweight gamification to make progress visible without adding friction.

## Problem

Productivity tools often become work to maintain. Users need a private, low-friction desktop app that helps them track focus, habits, and progress while encouraging consistency over perfection.

## Target Users

- Individuals building deep work routines.
- Students, creators, developers, and knowledge workers.
- Users who prefer local tools, privacy, customization, and offline access.

## Product Principles

- Stay out of the user's way.
- Minimize setup and daily friction.
- Encourage consistency instead of perfection.
- Reward progress instead of perfection.
- Keep all user data local by default.
- Prioritize desktop and offline usage.
- Keep the app customizable and lightweight.

## MVP Features

### Dashboard

The dashboard is the home screen and should immediately communicate progress without overwhelming the user.

Include:

- User profile
- Level and EXP
- Consistency score
- Current streak
- Weekly activity
- Daily focus statistics
- Quick access to Focus Room, Habit Tracker, AI Review, and Settings

Do not display the user's location anywhere on the dashboard.

### Focus Room

A calm deep work environment inspired by Discord's Lofi Activity.

Include:

- Pomodoro timer
- Spotify integration entry point
- Future-ready support for local music (UI designed to allow local music selection, but implementation deferred; no local music player code during MVP)
- Ambient sound selector
- Background selector
- Session statistics
- Current focus streak
- Today's focused time

Successful Pomodoro sessions award EXP. Longer sessions award more EXP, consecutive sessions provide a small bonus, and daily consistency should matter more than extremely long sessions.

After four consecutive completed Pomodoro sessions, Flow Mode activates. Flow Mode should add a subtle blue glow around the timer, slightly increase EXP, and celebrate uninterrupted focus without becoming distracting.

### Habit Tracker

A low-friction habit system inspired by Habitify Desktop.

Include:

- Daily habits
- Weekly overview
- GitHub-style contribution grid
- Habit streaks
- Completion history
- EXP for completed habits

Completing habits should require as few clicks as possible.

### Local AI Review

Use a local Ollama model to generate productivity reviews from tracked data.

Review types:

- Daily
- Weekly
- Monthly
- Yearly

Each review should include:

- Progress summary
- Accomplishments
- Areas for improvement
- Habit consistency
- Focus trends
- Personalized suggestions
- Actionable next steps

AI feedback must be based on available local data, not generic motivational advice.

### Customization

Users should be able to customize:

- Background image
- Profile picture
- Primary accent color
- Theme

## Data

All user data should remain local unless a future task explicitly changes this requirement.

Likely local data:

- User profile preferences
- Focus sessions
- Pomodoro completions
- Flow Mode streak state
- Habits
- Habit completions
- EXP and level progress
- AI review inputs and generated review history
- Theme and customization settings

## Non-Goals

Do not design or implement during the MVP:

- Cloud synchronization
- User authentication
- Social features
- Leaderboards
- Online databases
- Team collaboration
- Complex RPG mechanics
- Mobile support
- Cloud LLM fallback (AI reviews require locally-installed Ollama; the app does not attempt to reach cloud APIs if Ollama is unavailable)

## Future Considerations

Keep the architecture flexible enough to support later:

- Interactive skill tree
- AI study companion
- Plugin system
- Analytics dashboard
- Calendar integration
- Achievement system
- Session timeline
- Additional local AI features

Do not design these features in detail yet.

## MVP Success Criteria

- The app launches quickly on desktop.
- The core dashboard communicates progress clearly.
- Users can complete focus sessions and habits with low friction.
- EXP and streaks reinforce consistency without pressure.
- Local AI reviews produce concise, actionable feedback from tracked data.
- User data remains private and local by default.
