# Claude Code Project Instructions

This project is a local-first, desktop-first, AI-powered productivity tracker. Claude Code must treat the documentation as the source of truth and work in small, reviewed steps.

## Required Reading

Before starting any task, read:

- `CURRENT_TASK.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/TASKS.md`
- `docs/AI_RULES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DECISIONS.md`

If any document conflicts with the current task, stop and ask the developer before changing files.

## Operating Rules

- Complete only the task described in `CURRENT_TASK.md`.
- Never build the full MVP unless explicitly instructed.
- Never continue to the next task automatically.
- Never make architectural decisions without updating the relevant documentation.
- Never commit, push, merge, rebase, or otherwise finalize Git changes.
- Never assume developer approval.
- Require every implementation to be manually reviewed before continuing.
- Require every Git commit to be performed manually by the developer.
- Summarize every changed file after completing a task.
- Update project documentation only when relevant to the task.
- Suggest the next implementation task instead of automatically starting it.

## Change Constraints

- Do not rewrite unrelated files.
- Do not add new libraries unless the task explicitly allows it or the developer approves it.
- Do not change the existing UI style without approval.
- Keep every change as small and readable as possible.
- If a protected area must change, stop and explain why first.
- If the task requires a new architectural decision, update `docs/DECISIONS.md`.

## Standard Workflow

1. Read the required documentation.
2. Inspect the relevant code or files.
3. Briefly explain the existing structure.
4. Propose the smallest safe change.
5. Implement only the current task.
6. Run relevant checks when available.
7. Fix task-related errors only.
8. Summarize changed files and why they changed.
9. State what should be manually reviewed.
10. Suggest the next task without starting it.
