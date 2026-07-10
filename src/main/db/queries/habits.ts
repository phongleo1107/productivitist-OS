import type Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { DEFAULT_USER_ID } from '../constants'
import { todayLocalDate } from '../dates'

export type HabitFrequency = 'daily' | 'weekly'

export interface HabitRow {
  id: string
  user_id: string
  name: string
  frequency: HabitFrequency
  created_date: string
  created_at: string
  updated_at: string
  archived: number
  archived_at: string | null
}

export interface CreateHabitInput {
  name: string
  frequency: HabitFrequency
  /** Local date (YYYY-MM-DD) the habit starts tracking; defaults to today. */
  createdDate?: string
  userId?: string
}

function getHabitOrThrow(db: Database.Database, id: string): HabitRow {
  const habit = getHabit(db, id)
  if (!habit) throw new Error(`Habit not found: ${id}`)
  return habit
}

/** Returns one habit by id, or undefined if it does not exist. */
export function getHabit(db: Database.Database, id: string): HabitRow | undefined {
  return db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as HabitRow | undefined
}

/**
 * Creates a habit definition. Frequency is immutable after creation because
 * changing it would reinterpret streak history (see SCHEMA_PROPOSAL.md).
 */
export function createHabit(db: Database.Database, input: CreateHabitInput): HabitRow {
  const id = randomUUID()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO habits
       (id, user_id, name, frequency, created_date, created_at, updated_at, archived, archived_at)
     VALUES
       (@id, @userId, @name, @frequency, @createdDate, @createdAt, @updatedAt, 0, NULL)`
  ).run({
    id,
    userId: input.userId ?? DEFAULT_USER_ID,
    name: input.name,
    frequency: input.frequency,
    createdDate: input.createdDate ?? todayLocalDate(),
    createdAt: now,
    updatedAt: now
  })
  return getHabitOrThrow(db, id)
}

/** Lists habits, active-only by default. Newest first. */
export function listHabits(
  db: Database.Database,
  options: { userId?: string; includeArchived?: boolean } = {}
): HabitRow[] {
  const userId = options.userId ?? DEFAULT_USER_ID
  if (options.includeArchived) {
    return db
      .prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as HabitRow[]
  }
  return db
    .prepare('SELECT * FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC')
    .all(userId) as HabitRow[]
}

/**
 * Archives a habit: sets `archived` and `archived_at` together (transaction
 * contract #4). Archiving is permanent in MVP and preserves completion history.
 * A no-op if the habit is already archived.
 */
export function archiveHabit(db: Database.Database, id: string): HabitRow {
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE habits
     SET archived = 1, archived_at = @archivedAt, updated_at = @updatedAt
     WHERE id = @id AND archived = 0`
  ).run({ id, archivedAt: now, updatedAt: now })
  return getHabitOrThrow(db, id)
}
