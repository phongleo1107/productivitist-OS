/** Fixed id for the single local user (see SCHEMA_PROPOSAL.md — single-user MVP). */
export const DEFAULT_USER_ID = 'default-user'

/**
 * EXP formula version stamped on every award so future formula changes never
 * rewrite historical EXP (see SCHEMA_PROPOSAL.md "EXP and levels").
 */
export const FOCUS_EXP_FORMULA_VERSION = 1
export const HABIT_EXP_FORMULA_VERSION = 1

/** Fixed EXP award per completed habit period; reversed with the same magnitude on unmark. */
export const HABIT_COMPLETION_EXP_AMOUNT = 10
