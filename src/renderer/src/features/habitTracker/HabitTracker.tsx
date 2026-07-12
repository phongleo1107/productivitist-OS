import { useEffect, useState } from 'react'
import { habitTrackerMockData } from './mockData'
import type { Habit, HabitFrequency } from './mockData'
import { onHabitToggle } from './habitCompletion'
import {
  buildContributionGrid,
  calculateStreaks,
  getCurrentPeriodStart,
  isPeriodCompletedOnDate
} from './habitStats'
import HabitList from './HabitList'
import WeeklyOverview from './WeeklyOverview'
import ContributionGrid from './ContributionGrid'
import AddHabitForm from './AddHabitForm'
import './habitTracker.css'

interface HabitTrackerProps {
  onNavigateToDashboard?: () => void
}

const GRID_DAYS = 365

/**
 * Manual habit ordering is a display-only preference, kept in localStorage
 * rather than the database — the habits schema (Task 6) is finalized and a
 * sort-order column would be a schema change outside this task's scope.
 */
const HABIT_ORDER_STORAGE_KEY = 'habitTracker.habitOrder'

function loadHabitOrder(): string[] {
  try {
    const raw = localStorage.getItem(HABIT_ORDER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveHabitOrder(habits: Habit[]): void {
  localStorage.setItem(HABIT_ORDER_STORAGE_KEY, JSON.stringify(habits.map((h) => h.id)))
}

/** Sorts `habits` by a saved id order; habits not in it (e.g. newly created) keep their relative order at the end. */
function applyHabitOrder(habits: Habit[], order: string[]): Habit[] {
  const orderIndex = new Map(order.map((id, index) => [id, index]))
  return [...habits].sort((a, b) => {
    const aIndex = orderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bIndex = orderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
    return aIndex - bIndex
  })
}

/** Ensures the tracked habits exist in the database, creating the starter set on first run. */
async function loadOrSeedHabits(): Promise<
  { id: string; name: string; frequency: Habit['frequency'] }[]
> {
  const existing = await window.api.db.listHabits()
  if (existing.length > 0) {
    return existing.map((habit) => ({
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency
    }))
  }

  const created = await Promise.all(
    habitTrackerMockData.habits.map((habit) =>
      window.api.db.createHabit({ name: habit.name, frequency: habit.frequency })
    )
  )
  return created.map((habit) => ({ id: habit.id, name: habit.name, frequency: habit.frequency }))
}

function HabitTracker({ onNavigateToDashboard }: HabitTrackerProps): React.JSX.Element {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completionsByHabit, setCompletionsByHabit] = useState<Record<string, string[]>>({})
  const [gridHistory, setGridHistory] = useState(habitTrackerMockData.gridHistory)
  const [currentExp, setCurrentExp] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [expAwarded, setExpAwarded] = useState<number | null>(null)
  const [flashHabitId, setFlashHabitId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const totalCompleted = habits.filter((habit) => habit.completedToday).length

  const fetchExpStats = async (): Promise<void> => {
    try {
      const [exp, level] = await Promise.all([
        window.api.db.getCurrentExp(),
        window.api.db.getCurrentLevel()
      ])
      setCurrentExp(exp)
      setCurrentLevel(level)
    } catch (error) {
      console.error('Failed to fetch EXP stats:', error)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      setIsLoading(true)
      setLoadError(null)
      try {
        const seeded = await loadOrSeedHabits()
        const periodsList = await Promise.all(
          seeded.map((habit) => window.api.db.listCompletedPeriods(habit.id))
        )
        if (cancelled) return

        const completions: Record<string, string[]> = {}
        const now = new Date()
        const loadedHabits: Habit[] = seeded.map((habit, index) => {
          const periods = periodsList[index]
          completions[habit.id] = periods
          const { currentStreak, bestStreak } = calculateStreaks(periods, habit.frequency, now)
          return {
            id: habit.id,
            name: habit.name,
            frequency: habit.frequency,
            completedToday: isPeriodCompletedOnDate(habit.frequency, periods, now),
            currentStreak,
            bestStreak
          }
        })

        const orderedHabits = applyHabitOrder(loadedHabits, loadHabitOrder())
        setHabits(orderedHabits)
        setCompletionsByHabit(completions)
        setGridHistory(buildContributionGrid(orderedHabits, completions, GRID_DAYS, now))
        await fetchExpStats()
      } catch (error) {
        console.error('Failed to load habits:', error)
        if (!cancelled) {
          const message = error instanceof Error ? error.message : String(error)
          setLoadError(
            `Could not load habits from the local database (${message}). If you just changed ` +
              `main-process or preload code, fully restart "npm run dev" — Vite hot-reloads the ` +
              `renderer but not the Electron main/preload process.`
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const handleToggleHabit = (habitId: string): void => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const now = new Date()
    const periodStart = getCurrentPeriodStart(habit.frequency, now)
    const newCompleted = !habit.completedToday
    const previousHabits = habits
    const previousCompletions = completionsByHabit

    setFlashHabitId(habitId)
    window.setTimeout(
      () => setFlashHabitId((current) => (current === habitId ? null : current)),
      400
    )

    setHabits((currentHabits) =>
      currentHabits.map((h) => (h.id === habitId ? { ...h, completedToday: newCompleted } : h))
    )

    onHabitToggle(habitId, periodStart, newCompleted)
      .then((result) => {
        const updatedPeriods = result.habitCompleted
          ? Array.from(new Set([...(previousCompletions[habitId] ?? []), periodStart]))
          : (previousCompletions[habitId] ?? []).filter((period) => period !== periodStart)

        const { currentStreak, bestStreak } = calculateStreaks(updatedPeriods, habit.frequency, now)

        setHabits((currentHabits) =>
          currentHabits.map((h) =>
            h.id === habitId
              ? { ...h, completedToday: result.habitCompleted, currentStreak, bestStreak }
              : h
          )
        )

        setCompletionsByHabit((current) => {
          const next = { ...current, [habitId]: updatedPeriods }
          setGridHistory(buildContributionGrid(habits, next, GRID_DAYS, now))
          return next
        })

        setExpAwarded(result.expAwarded)
        window.setTimeout(() => setExpAwarded(null), 3000)
        fetchExpStats()
      })
      .catch((error) => {
        console.error('Failed to save habit completion:', error)
        setHabits(previousHabits)
        setCompletionsByHabit(previousCompletions)
      })
  }

  const handleAddHabit = async (name: string, frequency: HabitFrequency): Promise<void> => {
    const created = await window.api.db.createHabit({ name, frequency })
    const now = new Date()

    const habitsWithNew = [
      ...habits,
      {
        id: created.id,
        name: created.name,
        frequency: created.frequency,
        completedToday: false,
        currentStreak: 0,
        bestStreak: 0
      }
    ]
    setHabits(habitsWithNew)
    saveHabitOrder(habitsWithNew)
    setCompletionsByHabit((current) => {
      const next = { ...current, [created.id]: [] }
      setGridHistory(buildContributionGrid(habitsWithNew, next, GRID_DAYS, now))
      return next
    })
  }

  const handleReorderHabit = (habitId: string, direction: 'up' | 'down'): void => {
    setHabits((currentHabits) => {
      const habit = currentHabits.find((h) => h.id === habitId)
      if (!habit) return currentHabits

      // Reorder within the same frequency group only — swap with the nearest
      // sibling of the same frequency, not the next habit in the raw array,
      // which may belong to the other (Daily/Weekly) section.
      const sameFrequencyIds = currentHabits
        .filter((h) => h.frequency === habit.frequency)
        .map((h) => h.id)
      const posInGroup = sameFrequencyIds.indexOf(habitId)
      const swapPos = direction === 'up' ? posInGroup - 1 : posInGroup + 1
      if (swapPos < 0 || swapPos >= sameFrequencyIds.length) return currentHabits

      const swapId = sameFrequencyIds[swapPos]
      const indexA = currentHabits.findIndex((h) => h.id === habitId)
      const indexB = currentHabits.findIndex((h) => h.id === swapId)
      const next = [...currentHabits]
      ;[next[indexA], next[indexB]] = [next[indexB], next[indexA]]

      saveHabitOrder(next)
      return next
    })
  }

  const handleDeleteHabit = async (habitId: string): Promise<void> => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return
    if (
      !window.confirm(
        `Delete "${habit.name}"? Its completion history is kept but it will no longer be tracked.`
      )
    ) {
      return
    }

    try {
      await window.api.db.archiveHabit(habitId)
    } catch (error) {
      console.error('Failed to delete habit:', error)
      return
    }

    const now = new Date()
    const remainingHabits = habits.filter((h) => h.id !== habitId)
    setHabits(remainingHabits)
    saveHabitOrder(remainingHabits)
    setCompletionsByHabit((current) => {
      const next = { ...current }
      delete next[habitId]
      setGridHistory(buildContributionGrid(remainingHabits, next, GRID_DAYS, now))
      return next
    })
  }

  const dailyHabits = habits.filter((habit) => habit.frequency === 'daily')
  const weeklyHabits = habits.filter((habit) => habit.frequency === 'weekly')

  return (
    <main className="habit-tracker">
      <button
        type="button"
        className="back-button"
        onClick={onNavigateToDashboard}
        aria-label="Back to dashboard"
      >
        ← Back
      </button>

      <div className="tracker-content">
        <header className="tracker-header">
          <h1>Habit Tracker</h1>
          <div className="header-stats">
            <div className="stat">
              <dt>Today</dt>
              <dd>
                {totalCompleted}/{habits.length}
              </dd>
            </div>
            <div className="stat">
              <dt>Streak</dt>
              <dd
                key={habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)}
                className="streak-value"
              >
                {habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)}
                <span className="streak-icon">🔥</span>
              </dd>
            </div>
            <div className="stat">
              <dt>Level</dt>
              <dd>{currentLevel}</dd>
            </div>
            <div className="stat">
              <dt>EXP</dt>
              <dd>{currentExp}</dd>
            </div>
          </div>
          {expAwarded !== null && (
            <div className="exp-earned-toast">
              <span>
                {expAwarded > 0 ? '+' : ''}
                {expAwarded} EXP
              </span>
            </div>
          )}
        </header>

        {isLoading ? (
          <section className="tracker-section">
            <p className="tracker-loading">Loading habits…</p>
          </section>
        ) : loadError ? (
          <section className="tracker-section">
            <div className="tracker-error">
              <p>{loadError}</p>
              <button
                type="button"
                className="retry-button"
                onClick={() => setReloadToken((token) => token + 1)}
              >
                Retry
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="tracker-section">
              <h2>Daily Habits</h2>
              {dailyHabits.length === 0 ? (
                <p className="tracker-empty">No daily habits yet.</p>
              ) : (
                <HabitList
                  habits={dailyHabits}
                  onToggleHabit={handleToggleHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onReorderHabit={handleReorderHabit}
                  flashHabitId={flashHabitId}
                />
              )}
            </section>

            <section className="tracker-section">
              <h2>Weekly Habits</h2>
              {weeklyHabits.length === 0 ? (
                <p className="tracker-empty">No weekly habits yet.</p>
              ) : (
                <HabitList
                  habits={weeklyHabits}
                  onToggleHabit={handleToggleHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onReorderHabit={handleReorderHabit}
                  flashHabitId={flashHabitId}
                />
              )}
              <AddHabitForm onAddHabit={handleAddHabit} />
            </section>
          </>
        )}

        <section className="tracker-section">
          <h2>Weekly Overview</h2>
          <WeeklyOverview habits={habits} completionsByHabit={completionsByHabit} />
        </section>

        <section className="tracker-section">
          <h2>Completion History</h2>
          <ContributionGrid history={gridHistory} />
        </section>
      </div>
    </main>
  )
}

export default HabitTracker
