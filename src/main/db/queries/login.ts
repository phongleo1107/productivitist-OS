import type Database from 'better-sqlite3'
import { DEFAULT_USER_ID } from '../constants'
import { todayLocalDate } from '../dates'

export interface LoginDayRow {
  user_id: string
  login_date: string
  first_opened_at: string
  last_opened_at: string
  open_count: number
}

/**
 * Upserts today's login_days row in one statement (transaction contract #3):
 * first open of the day inserts open_count = 1, later opens on the same date
 * increment open_count and bump last_opened_at. Call once per app startup.
 */
export function recordAppOpen(
  db: Database.Database,
  options: { userId?: string; loginDate?: string } = {}
): LoginDayRow {
  const userId = options.userId ?? DEFAULT_USER_ID
  const loginDate = options.loginDate ?? todayLocalDate()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO login_days (user_id, login_date, first_opened_at, last_opened_at, open_count)
     VALUES (@userId, @loginDate, @now, @now, 1)
     ON CONFLICT (user_id, login_date)
     DO UPDATE SET last_opened_at = @now, open_count = open_count + 1`
  ).run({ userId, loginDate, now })

  return db
    .prepare('SELECT * FROM login_days WHERE user_id = ? AND login_date = ?')
    .get(userId, loginDate) as LoginDayRow
}

/** Distinct login dates ordered oldest to newest, for streak/consistency calculations. */
export function listLoginDates(db: Database.Database, options: { userId?: string } = {}): string[] {
  const userId = options.userId ?? DEFAULT_USER_ID
  const rows = db
    .prepare('SELECT login_date FROM login_days WHERE user_id = ? ORDER BY login_date ASC')
    .all(userId) as { login_date: string }[]
  return rows.map((row) => row.login_date)
}
