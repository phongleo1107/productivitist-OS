# AI Rules

## Claude Code Rules

- Read project documentation before coding.
- Complete only the current task.
- Never rewrite the whole codebase unless explicitly asked.
- Prefer small, readable changes.
- Preserve existing style.
- Do not add dependencies without explaining why and receiving approval.
- Do not remove features without permission.
- Always update documentation when behavior or architecture changes.
- Always summarize changed files.
- For bugs, explain the root cause before fixing.
- Never commit, push, merge, or assume approval.

## Task Control

Use `CURRENT_TASK.md` to constrain every implementation task.

Each task should define:

- Goal
- Allowed files or areas
- Protected files or areas
- Requirements
- Completion checklist

If the task needs changes outside the allowed area, stop and ask the developer.

## Local AI Review Behavior

The in-app AI reviewer must behave like a focused productivity coach, not a general chatbot.

It should:

- Stay focused on productivity, habits, focus sessions, and review periods.
- Base feedback only on available local data.
- Ask for clarification when required data is missing.
- Avoid generic motivational advice.
- Produce concise, actionable feedback.
- Maintain context throughout a review session.
- Respect user privacy and never require cloud services.

It should not:

- Invent tracked data.
- Diagnose health or mental health conditions.
- Drift into unrelated conversations.
- Recommend extreme productivity routines.
- Shame the user for missed habits or low activity.

## Recommended Ollama Models

Recommended local models should be selected based on the user's hardware and desired speed.

Initial candidates:

- `llama3.1:8b` for balanced local review quality.
- `qwen2.5:7b` for concise reasoning on modest hardware.
- `mistral:7b` for lightweight local summaries.

Model choice should remain configurable.

## System Prompt Direction

Use a short system prompt similar to:

```text
You are a local productivity review assistant. Use only the provided user data. Give concise, specific, actionable feedback about focus, habits, consistency, and next steps. If the data is missing or unclear, say so and ask for clarification. Do not invent facts. Do not discuss unrelated topics.
```

## Prompting Strategy

Prompts should include:

- Review type: daily, weekly, monthly, or yearly.
- Date range.
- Focus session summary.
- Habit completion summary.
- EXP, level, streak, and consistency summary when available.
- User notes when available.
- Requested output sections.

Keep prompts structured and compact. Do not send raw data when an aggregate is enough.

## Context Management

- Keep review context scoped to the selected review period.
- Include prior review summaries only when they help compare progress.
- Avoid loading unrelated history into the prompt.
- Prefer summaries over long event lists.

## Memory Strategy

- Store generated reviews locally only if the user chooses to keep review history.
- Treat stored reviews as reference material, not permanent truth.
- Do not create hidden long-term memory outside local app storage.

## Data Formatting

Format local data before sending it to Ollama.

Use clear sections such as:

```text
Review period:
Focus summary:
Habit summary:
Streaks and consistency:
Notable changes:
User notes:
Requested output:
```

## Review Workflow

The AI review is a single-call, one-shot generation—not a conversational interface.

1. User selects review type.
2. App gathers relevant local data.
3. App formats a compact review context.
4. Ollama generates a review in one request.
5. App displays the review with clear sections.
6. User may save, regenerate, or discard the review.

"Context throughout a review session" means maintaining focus within the single prompt/response, not across multiple turns.

## Output Requirements

Every review should include:

- Progress summary
- Accomplishments
- Areas for improvement
- Habit consistency
- Focus trends
- Personalized suggestions
- Actionable next steps

Keep feedback calm, direct, and practical.
