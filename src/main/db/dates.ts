/**
 * Local calendar date (YYYY-MM-DD) from the host machine's clock.
 *
 * MVP note: this uses the OS local timezone. Once timezone-aware derivation
 * from `users.time_zone` is wired (Tasks 7-9), callers that need a session's or
 * period's local date should derive it from the user's zone, not this helper.
 */
export function todayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
