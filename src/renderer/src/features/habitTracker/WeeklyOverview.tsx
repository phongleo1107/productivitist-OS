import type { Habit } from './mockData'
import { isPeriodCompletedOnDate } from './habitStats'

interface WeeklyOverviewProps {
  habits: Habit[]
  completionsByHabit: Record<string, string[]>
}

function WeeklyOverview({ habits, completionsByHabit }: WeeklyOverviewProps): React.JSX.Element {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="weekly-overview">
      <div className="week-grid">
        {last7Days.map((date, dayIndex) => {
          const dayCompletions = habits.map((habit) =>
            isPeriodCompletedOnDate(habit.frequency, completionsByHabit[habit.id] ?? [], date)
          )
          const completedCount = dayCompletions.filter(Boolean).length
          const completionRate = habits.length > 0 ? completedCount / habits.length : 0

          return (
            <div key={dayIndex} className="week-day">
              <div className="day-progress">
                <div
                  className="progress-box"
                  style={{
                    opacity: Math.max(0.2, completionRate),
                    backgroundColor: `rgba(139, 92, 246, ${completionRate})`
                  }}
                  title={`${completedCount}/${habits.length} completed`}
                />
                <span className="progress-text">
                  {completedCount}/{habits.length}
                </span>
              </div>
              <div className="day-label">{dayLabels[dayIndex]}</div>
              <div className="day-date">{date.getDate()}</div>
              <div className="day-habits">
                {habits.map((habit, habitIndex) => {
                  const completed = dayCompletions[habitIndex]
                  return (
                    <div
                      key={habit.id}
                      className={`habit-dot ${completed ? 'completed' : 'missed'}`}
                      title={`${habit.name}: ${completed ? 'completed' : 'missed'}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyOverview
