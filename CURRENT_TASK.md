# Current Task

Task 6: Local Persistence Foundation (from `docs/TASKS.md`).

## Goal

Design and implement local data persistence after the developer approves the data model. Data must remain fully local and cover profile settings, focus sessions, habits, completions, EXP, streaks, and AI review history.

Task 5 (Static Habit Tracker UI) was completed and is ready for manual review.
Task 4 (Static Focus Room UI) was completed on 2026-07-09.

## Allowed To Change

- Persistence layer files approved for Task 6
- Data model/schema files approved for Task 6
- Architecture documentation for the approved local storage approach
- `docs/DECISIONS.md` if a storage/schema decision is made
- This file

## Do Not Touch

- Focus Room, Dashboard, Habit Tracker, AI Review, and Settings feature implementations except where a narrow persistence interface or mock-data adapter is explicitly required
- `src/main/` and `src/preload/` unless the approved persistence approach explicitly requires main/preload IPC changes
- Cloud, auth, telemetry, or online database integrations
- Git history
- Unrelated documentation

## Requirements

- Start with a proposed local data model/schema and get developer approval before implementation.
- Data remains fully local.
- Schema or storage shape is documented.
- No cloud, auth, telemetry, or online database is introduced.
- Existing static UI remains functional.
- Keep the persistence surface narrow and testable.
- Prefer a small implementation that can support Tasks 7-10 without overbuilding.
- Do not implement Pomodoro behavior, habit completion behavior, dashboard aggregation, or Ollama review generation in this task.

## Model Split

- Use GPT-5.6 for schema, storage shape, migration strategy, data contracts, and edge-case review.
- Use Claude for implementation after the schema is approved.
- Use Fable 5 only if GPT-5.6 fails verification or needs an independent second opinion.
- Do not spend GPT-5.6 on routine UI wiring, formatting, or simple file edits.

## Completion Checklist

- [ ] Relevant documentation was read.
- [ ] Proposed data model/schema was reviewed and approved by the developer.
- [ ] Only approved files were changed.
- [ ] Relevant checks were run or skipped with explanation.
- [ ] Changed files were summarized.
- [ ] Manual review is ready.
- [ ] Next task was suggested but not started.

## Review Status

✅ **Schema approved by GPT-5.6** on 2026-07-10. 

**Approved design includes:**
- UTC timestamps + timezone-aware date derivation
- EXP ledger (1 per focus minute, 10 per habit)
- Streak gap threshold (4 hours for Flow Mode)
- Monday-based ISO weeks for weekly habits
- Calculated streaks (no stored streak tables)
- Consistency = login days / eligible calendar days
- Transaction contracts for multi-table operations

**Confidence: 4/5** (implementation risk around timezone + atomic operations, not schema risk)

---

## Implementation Status

**Stream 1 (GPT-5.6):** ✅ Complete
**Stream 2 (Claude Implementation):** Ready to start

## Notes

Task 6 builds only the persistence foundation. Tasks 7–11 wire behavior against this schema without modifying it. Streak calculation, EXP ledger, and timezone logic are foundational—get them right here.
