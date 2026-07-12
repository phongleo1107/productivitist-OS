import type Database from 'better-sqlite3'
import { DEFAULT_USER_ID } from '../constants'
import { todayLocalDate } from '../dates'

export interface UserRow {
  id: string
  name: string
  accent_color: string
  theme: 'dark' | 'light' | 'system'
  profile_picture_path: string | null
  background_image_path: string | null
  time_zone: string
  week_starts_on: number
  tracking_start_date: string
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  name?: string
  accent_color?: string
  theme?: 'dark' | 'light' | 'system'
  profile_picture_path?: string | null
  background_image_path?: string | null
  time_zone?: string
  week_starts_on?: number
  tracking_start_date?: string
}

/** Inserts the default user row if none exists yet. Safe to call on every startup. */
export function ensureDefaultUser(db: Database.Database): UserRow {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER_ID) as
    UserRow | undefined
  if (existing) return existing

  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO users (id, tracking_start_date, created_at, updated_at)
     VALUES (@id, @tracking_start_date, @created_at, @updated_at)`
  ).run({
    id: DEFAULT_USER_ID,
    tracking_start_date: todayLocalDate(),
    created_at: now,
    updated_at: now
  })

  return db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER_ID) as UserRow
}

/** Returns the single user row, creating the default one first if needed. */
export function getUser(db: Database.Database): UserRow {
  return ensureDefaultUser(db)
}

const UPDATABLE_COLUMNS: (keyof UserProfileUpdate)[] = [
  'name',
  'accent_color',
  'theme',
  'profile_picture_path',
  'background_image_path',
  'time_zone',
  'week_starts_on',
  'tracking_start_date'
]

/**
 * Updates only profile/preference columns on the users row. Never touches
 * progression data (EXP, levels, streaks) per the schema's data ownership rule.
 */
export function updateUserProfile(db: Database.Database, update: UserProfileUpdate): UserRow {
  ensureDefaultUser(db)

  const columns = UPDATABLE_COLUMNS.filter((column) => update[column] !== undefined)
  if (columns.length === 0) return getUser(db)

  const setClause = columns.map((column) => `${column} = @${column}`).join(', ')
  db.prepare(`UPDATE users SET ${setClause}, updated_at = @updated_at WHERE id = @id`).run({
    ...update,
    updated_at: new Date().toISOString(),
    id: DEFAULT_USER_ID
  })

  return getUser(db)
}
