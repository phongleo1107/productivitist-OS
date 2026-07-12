import type { HabitFrequency } from './mockData'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Monday (YYYY-MM-DD, UTC) of the ISO week containing `date`. */
export function getMondayForDate(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayOfWeek = utcDate.getUTCDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  utcDate.setUTCDate(utcDate.getUTCDate() - diffToMonday)
  return formatDate(utcDate)
}

/** Local calendar date (YYYY-MM-DD) for `date`, defaulting to now. */
export function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** The current period's start for a habit's frequency: today for daily, this week's Monday for weekly. */
export function getCurrentPeriodStart(frequency: HabitFrequency, now: Date = new Date()): string {
  return frequency === 'weekly' ? getMondayForDate(now) : getLocalDate(now)
}

/** Whether `periods` (period_start strings) contains the period covering `date` for this habit's frequency. */
export function isPeriodCompletedOnDate(
  frequency: HabitFrequency,
  periods: string[],
  date: Date
): boolean {
  const key = frequency === 'weekly' ? getMondayForDate(date) : getLocalDate(date)
  return periods.includes(key)
}

export interface StreakResult {
  currentStreak: number
  bestStreak: number
}

/**
 * Computes current and best streaks from a habit's completed period_start
 * dates. `periods` need not be sorted. Daily habits step one calendar day per
 * period; weekly habits step seven days (Monday-to-Monday).
 *
 * Current streak is 0 unless the most recent completed period is the current
 * period or the one immediately before it (so an unfinished "today"/"this
 * week" does not zero out yesterday's run).
 */
export function calculateStreaks(
  periods: string[],
  frequency: HabitFrequency,
  now: Date = new Date()
): StreakResult {
  if (periods.length === 0) return { currentStreak: 0, bestStreak: 0 }

  const stepDays = frequency === 'weekly' ? 7 : 1
  const indices = Array.from(
    new Set(
      periods.map((period) => Math.round(parseLocalDate(period).getTime() / MS_PER_DAY / stepDays))
    )
  ).sort((a, b) => a - b)

  let bestStreak = 1
  let run = 1
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      run += 1
    } else {
      run = 1
    }
    bestStreak = Math.max(bestStreak, run)
  }

  const asOfIndex = Math.round(
    parseLocalDate(getCurrentPeriodStart(frequency, now)).getTime() / MS_PER_DAY / stepDays
  )
  const lastIndex = indices[indices.length - 1]

  if (asOfIndex - lastIndex > 1) {
    return { currentStreak: 0, bestStreak }
  }

  let currentStreak = 1
  for (let i = indices.length - 1; i > 0; i--) {
    if (indices[i] === indices[i - 1] + 1) {
      currentStreak += 1
    } else {
      break
    }
  }

  return { currentStreak, bestStreak }
}

export interface HabitForGrid {
  id: string
  frequency: HabitFrequency
}

/**
 * Builds contribution-grid entries for the last `days` calendar dates from every habit's
 * completed periods. Uses `isPeriodCompletedOnDate` so a completed weekly period lights up
 * every day of that week, not just its Monday `period_start`. `completionRatio` (0-1) is the
 * fraction of habits completed on that date, for the grid's intensity levels.
 */
export function buildContributionGrid(
  habits: HabitForGrid[],
  completionsByHabit: Record<string, string[]>,
  days: number,
  now: Date = new Date()
): { date: string; completed: boolean; completionRatio: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - 1 - i))
    const dateStr = getLocalDate(date)

    if (habits.length === 0) {
      return { date: dateStr, completed: false, completionRatio: 0 }
    }

    const completedCount = habits.filter((habit) =>
      isPeriodCompletedOnDate(habit.frequency, completionsByHabit[habit.id] ?? [], date)
    ).length

    return {
      date: dateStr,
      completed: completedCount > 0,
      completionRatio: completedCount / habits.length
    }
  })
}
