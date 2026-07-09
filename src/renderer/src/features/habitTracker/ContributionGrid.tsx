import type { HabitGridEntry } from './mockData'

interface ContributionGridProps {
  history: HabitGridEntry[]
}

function ContributionGrid({ history }: ContributionGridProps): React.JSX.Element {
  // Group history by weeks (Sunday-Saturday)
  const weeks: HabitGridEntry[][] = []
  let currentWeek: HabitGridEntry[] = []

  history.forEach((entry) => {
    const date = new Date(entry.date)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(entry)
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="contribution-grid-container">
      <div className="grid-header">
        <div className="month-labels">
          {/* Approximate month labels based on visible dates */}
          <span style={{ marginLeft: '60px' }}>Apr</span>
          <span style={{ marginLeft: '60px' }}>May</span>
          <span style={{ marginLeft: '60px' }}>Jun</span>
        </div>
      </div>

      <div className="contribution-grid">
        <div className="day-axis">
          {dayNames.map((day) => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}
        </div>

        <div className="weeks">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week">
              {week.map((entry, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`day-cell ${entry.completed ? 'completed' : 'empty'}`}
                  title={`${entry.date}: ${entry.completed ? 'habit completed' : 'no completion'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-legend">
        <span className="legend-label">Less</span>
        <div className="legend-cells">
          <div className="day-cell empty" title="empty" />
          <div className="day-cell completed" style={{ opacity: 0.25 }} title="low" />
          <div className="day-cell completed" style={{ opacity: 0.5 }} title="medium" />
          <div className="day-cell completed" title="high" />
        </div>
        <span className="legend-label">More</span>
      </div>
    </div>
  )
}

export default ContributionGrid
