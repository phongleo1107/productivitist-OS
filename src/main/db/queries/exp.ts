import type Database from 'better-sqlite3'
import { DEFAULT_USER_ID } from '../constants'

export type ExpSourceType = 'focus_session' | 'habit_completion' | 'adjustment'

export interface InsertExpEventInput {
  idempotencyKey: string
  userId: string
  sourceType: ExpSourceType
  sourceId: string
  amount: number
  formulaVersion: number
  reason?: string | null
  createdAt: string
}

/**
 * Appends one row to the EXP ledger. Never updates or deletes existing rows;
 * reversals are recorded as new negative-amount events (see SCHEMA_PROPOSAL.md).
 *
 * This is a low-level insert with no transaction of its own: feature writers
 * must call it inside the same transaction that creates or reverses the source
 * activity (Data Ownership contract). The unique idempotency key makes retries
 * safe.
 */
export function insertExpEvent(db: Database.Database, input: InsertExpEventInput): void {
  db.prepare(
    `INSERT INTO exp_events
       (idempotency_key, user_id, source_type, source_id, amount, formula_version, reason, created_at)
     VALUES
       (@idempotencyKey, @userId, @sourceType, @sourceId, @amount, @formulaVersion, @reason, @createdAt)`
  ).run({
    idempotencyKey: input.idempotencyKey,
    userId: input.userId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    amount: input.amount,
    formulaVersion: input.formulaVersion,
    reason: input.reason ?? null,
    createdAt: input.createdAt
  })
}

/** Returns the current total EXP for the user (sum of all EXP events). */
export function getCurrentExp(db: Database.Database, userId: string = DEFAULT_USER_ID): number {
  const result = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total_exp FROM exp_events WHERE user_id = ?')
    .get(userId) as { total_exp: number }
  return result.total_exp
}

/**
 * Calculates the current level based on total EXP.
 * Returns the highest level whose exp_required_total <= totalExp.
 */
export function getCurrentLevel(db: Database.Database, userId: string = DEFAULT_USER_ID): number {
  const totalExp = getCurrentExp(db, userId)
  const result = db
    .prepare(
      `SELECT level FROM level_thresholds
       WHERE exp_required_total <= ?
       ORDER BY level DESC
       LIMIT 1`
    )
    .get(totalExp) as { level: number } | undefined
  return result?.level ?? 1
}
