import { useState } from 'react'
import { habitTrackerMockData } from './mockData'
import type { Habit } from './mockData'
import DailyHabits from './DailyHabits'
import WeeklyOverview from './WeeklyOverview'
import ContributionGrid from './ContributionGrid'
import './habitTracker.css'

interface HabitTrackerProps {
  onNavigateToDashboard?: () => void
}

function HabitTracker({ onNavigateToDashboard }: HabitTrackerProps): React.JSX.Element {
  const data = habitTrackerMockData
  const [habits, setHabits] = useState<Habit[]>(() => data.habits.map((habit) => ({ ...habit })))
  const totalCompleted = habits.filter((habit) => habit.completedToday).length

  const handleToggleHabit = (habitId: string): void => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === habitId ? { ...habit, completedToday: !habit.completedToday } : habit
      )
    )
  }

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
              <dd>{habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)} days</dd>
            </div>
          </div>
        </header>

        <section className="tracker-section">
          <h2>Daily Habits</h2>
          <DailyHabits habits={habits} onToggleHabit={handleToggleHabit} />
        </section>

        <section className="tracker-section">
          <h2>Weekly Overview</h2>
          <WeeklyOverview habits={habits} />
        </section>

        <section className="tracker-section">
          <h2>Completion History</h2>
          <ContributionGrid history={data.gridHistory} />
        </section>
      </div>
    </main>
  )
}

export default HabitTracker
