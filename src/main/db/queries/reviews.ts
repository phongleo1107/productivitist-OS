import type Database from 'better-sqlite3'
import { DEFAULT_USER_ID } from '../constants'

export type ReviewType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface AiReviewRow {
  id: number
  user_id: string
  review_type: ReviewType
  period_start: string
  period_end: string
  review_text: string
  created_at: string
  archived_at: string | null
}

export interface InsertAiReviewInput {
  reviewType: ReviewType
  /** Local period bounds (YYYY-MM-DD), inclusive; period_end >= period_start. */
  periodStart: string
  periodEnd: string
  reviewText: string
  userId?: string
}

function getAiReviewOrThrow(db: Database.Database, id: number): AiReviewRow {
  const review = getAiReview(db, id)
  if (!review) throw new Error(`AI review not found: ${id}`)
  return review
}

/** Returns one review by id, or undefined if it does not exist. */
export function getAiReview(db: Database.Database, id: number): AiReviewRow | undefined {
  return db.prepare('SELECT * FROM ai_reviews WHERE id = ?').get(id) as AiReviewRow | undefined
}

/**
 * Saves a generated review. Reviews are immutable once written (no text
 * updates); regenerating a period saves a new row, so multiple reviews may
 * share the same period (see SCHEMA_PROPOSAL.md).
 */
export function insertAiReview(db: Database.Database, input: InsertAiReviewInput): AiReviewRow {
  const info = db
    .prepare(
      `INSERT INTO ai_reviews
         (user_id, review_type, period_start, period_end, review_text, created_at, archived_at)
       VALUES
         (@userId, @reviewType, @periodStart, @periodEnd, @reviewText, @createdAt, NULL)`
    )
    .run({
      userId: input.userId ?? DEFAULT_USER_ID,
      reviewType: input.reviewType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      reviewText: input.reviewText,
      createdAt: new Date().toISOString()
    })

  return getAiReviewOrThrow(db, Number(info.lastInsertRowid))
}

/**
 * Lists reviews newest first, active-only by default, optionally filtered by
 * review type.
 */
export function listAiReviews(
  db: Database.Database,
  options: { userId?: string; includeArchived?: boolean; reviewType?: ReviewType } = {}
): AiReviewRow[] {
  const userId = options.userId ?? DEFAULT_USER_ID
  const conditions = ['user_id = @userId']
  if (!options.includeArchived) conditions.push('archived_at IS NULL')
  if (options.reviewType) conditions.push('review_type = @reviewType')

  return db
    .prepare(
      `SELECT * FROM ai_reviews
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC`
    )
    .all({ userId, reviewType: options.reviewType ?? null }) as AiReviewRow[]
}

/**
 * Lists reviews for one exact period (type + bounds), latest regeneration
 * first. Active-only by default.
 */
export function listAiReviewsForPeriod(
  db: Database.Database,
  query: {
    reviewType: ReviewType
    periodStart: string
    periodEnd: string
    userId?: string
    includeArchived?: boolean
  }
): AiReviewRow[] {
  const userId = query.userId ?? DEFAULT_USER_ID
  const conditions = [
    'user_id = @userId',
    'review_type = @reviewType',
    'period_start = @periodStart',
    'period_end = @periodEnd'
  ]
  if (!query.includeArchived) conditions.push('archived_at IS NULL')

  return db
    .prepare(
      `SELECT * FROM ai_reviews
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC`
    )
    .all({
      userId,
      reviewType: query.reviewType,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd
    }) as AiReviewRow[]
}

/**
 * Archives a review by stamping `archived_at`. Archival is the only permitted
 * mutation. A no-op if the review is already archived.
 */
export function archiveAiReview(db: Database.Database, id: number): AiReviewRow {
  db.prepare('UPDATE ai_reviews SET archived_at = ? WHERE id = ? AND archived_at IS NULL').run(
    new Date().toISOString(),
    id
  )
  return getAiReviewOrThrow(db, id)
}
