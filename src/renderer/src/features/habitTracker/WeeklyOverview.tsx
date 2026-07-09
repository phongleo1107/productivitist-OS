import type { Habit } from './mockData'

interface WeeklyOverviewProps {
  habits: Habit[]
}

function WeeklyOverview({ habits }: WeeklyOverviewProps): React.JSX.Element {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Mock completion pattern: recent days more completed
  const completionPattern = [0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0]

  return (
    <div className="weekly-overview">
      <div className="week-grid">
        {last7Days.map((date, dayIndex) => {
          const completionRate = completionPattern[dayIndex]
          const completedCount = habits.filter(
            (habit) => (habit.id.charCodeAt(0) + dayIndex) % 10 < Math.floor(completionRate * 10)
          ).length

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
                <span className="progress-text">{completedCount}/{habits.length}</span>
              </div>
              <div className="day-label">{dayLabels[dayIndex]}</div>
              <div className="day-date">{date.getDate()}</div>
              <div className="day-habits">
                {habits.map((habit) => {
                  const completed =
                    (habit.id.charCodeAt(0) + dayIndex) % 10 < Math.floor(completionRate * 10)
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
