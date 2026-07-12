import type { DashboardMockData } from './mockData'

interface LoginStreakCardProps {
  streak: DashboardMockData['loginStreak']
  consistencyPercent: number
}

function LoginStreakCard({ streak, consistencyPercent }: LoginStreakCardProps): React.JSX.Element {
  return (
    <section className="card streak-card" aria-label="Login streak">
      <h2 className="card-label">Login Streak</h2>
      <div className="streak-head">
        <div className="streak-stats">
          <div>
            <p className="streak-count">
              <span className="streak-days">{streak.currentStreakDays}</span> days
            </p>
            <p className="streak-caption">current streak</p>
          </div>
          <div>
            <p className="streak-count">
              <span className="streak-days">{consistencyPercent}%</span>
            </p>
            <p className="streak-caption">consistency</p>
          </div>
        </div>
        <p className="streak-cheer">Keep it going! 🔥</p>
      </div>
      <div className="streak-grid-wrap">
        <div className="streak-grid" aria-hidden="true">
          {streak.weeks.map((week, w) => (
            <div key={w} className="streak-week">
              {week.map((value, d) => (
                <span key={d} className={`streak-cell level-${value}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="streak-day-labels" aria-hidden="true">
          <span style={{ gridRow: 1 }}>Mon</span>
          <span style={{ gridRow: 3 }}>Wed</span>
          <span style={{ gridRow: 5 }}>Fri</span>
        </div>
      </div>
      <div
        className="streak-months"
        aria-hidden="true"
        style={{ gridTemplateColumns: `repeat(${streak.weeks.length}, 1fr)` }}
      >
        {streak.monthLabels.map((month) => (
          <span key={month.label} style={{ gridColumn: `${month.weekIndex + 1} / span 3` }}>
            {month.label}
          </span>
        ))}
      </div>
      <p className="visually-hidden">
        Login activity for the last {streak.weeks.length} weeks, currently a{' '}
        {streak.currentStreakDays} day streak.
      </p>
      <div className="streak-legend" aria-hidden="true">
        <span>Less</span>
        <span className="streak-cell level-0" />
        <span className="streak-cell level-1" />
        <span className="streak-cell level-2" />
        <span className="streak-cell level-3" />
        <span className="streak-cell level-4" />
        <span>More</span>
      </div>
    </section>
  )
}

export default LoginStreakCard
