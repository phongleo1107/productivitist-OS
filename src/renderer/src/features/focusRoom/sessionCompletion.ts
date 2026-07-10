export interface SessionCompletionResult {
  expAwarded: number
  sessionId: number
}

/**
 * Records a completed focus session to the database.
 *
 * @param actualDurationSeconds - actual time spent in the session
 * @param plannedDurationMinutes - target duration in minutes (e.g., 25 for Pomodoro)
 * @param startedAtIso - when session started (UTC ISO-8601)
 * @param clientEventId - stable idempotency key for this session
 * @returns expAwarded (EXP from session) and sessionId (DB row id)
 */
export async function onSessionComplete(
  actualDurationSeconds: number,
  plannedDurationMinutes: number,
  startedAtIso: string,
  clientEventId: string
): Promise<SessionCompletionResult> {
  const completedAtIso = new Date().toISOString()

  // Derive session_date (local date of completion in user's timezone).
  // For MVP: use today's date in YYYY-MM-DD format.
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const sessionDate = `${year}-${month}-${day}`

  // Call the database to insert the session and its EXP award (single transaction).
  const sessionRow = await window.api.db.insertFocusSession({
    clientEventId,
    sessionDate,
    plannedDurationMinutes,
    actualDurationSeconds,
    startedAt: startedAtIso,
    completedAt: completedAtIso
  })

  // Calculate EXP using the same formula as the backend:
  // one EXP per completed minute, minimum one.
  const expAwarded = Math.max(1, Math.floor(actualDurationSeconds / 60))

  return {
    expAwarded,
    sessionId: sessionRow.id
  }
}
