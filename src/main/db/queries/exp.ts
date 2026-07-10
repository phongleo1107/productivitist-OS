import type Database from 'better-sqlite3'

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
