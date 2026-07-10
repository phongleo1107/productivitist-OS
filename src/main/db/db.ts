import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import migration001 from './migrations/001_init.sql?raw'

interface Migration {
  name: string
  sql: string
}

const MIGRATIONS: Migration[] = [{ name: '001_init', sql: migration001 }]

function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)
}

function appliedMigrationNames(db: Database.Database): Set<string> {
  const rows = db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[]
  return new Set(rows.map((row) => row.name))
}

function runMigrations(db: Database.Database): void {
  ensureMigrationsTable(db)
  const applied = appliedMigrationNames(db)

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) continue

    const applyMigration = db.transaction(() => {
      db.exec(migration.sql)
      db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(
        migration.name,
        new Date().toISOString()
      )
    })
    applyMigration()
  }
}

/**
 * Level curve is quadratic (25 * level * (level - 1)) so early levels are
 * quick and later levels demand progressively more EXP. Level 1 is always 0.
 */
function generateLevelThresholds(maxLevel: number): { level: number; expRequiredTotal: number }[] {
  const thresholds: { level: number; expRequiredTotal: number }[] = []
  for (let level = 1; level <= maxLevel; level++) {
    thresholds.push({ level, expRequiredTotal: 25 * level * (level - 1) })
  }
  return thresholds
}

function seedLevelThresholds(db: Database.Database): void {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM level_thresholds').get() as {
    count: number
  }
  if (count > 0) return

  const insert = db.prepare(
    'INSERT INTO level_thresholds (level, exp_required_total) VALUES (@level, @expRequiredTotal)'
  )
  const insertAll = db.transaction((thresholds: ReturnType<typeof generateLevelThresholds>) => {
    for (const threshold of thresholds) insert.run(threshold)
  })
  insertAll(generateLevelThresholds(50))
}

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = join(app.getPath('userData'), 'productivitist-os.sqlite3')
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  runMigrations(db)
  seedLevelThresholds(db)

  dbInstance = db
  return db
}

export function closeDb(): void {
  dbInstance?.close()
  dbInstance = null
}
