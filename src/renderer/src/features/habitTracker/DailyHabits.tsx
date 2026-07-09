import type { Habit } from './mockData'

interface DailyHabitsProps {
  habits: Habit[]
}

function DailyHabits({ habits }: DailyHabitsProps): React.JSX.Element {
  return (
    <ul className="daily-habits-list">
      {habits.map((habit) => (
        <li key={habit.id} className="habit-item">
          <label className="habit-label">
            <input
              type="checkbox"
              className="habit-checkbox"
              checked={habit.completedToday}
              disabled
              aria-label={habit.name}
            />
            <span className="habit-name">{habit.name}</span>
          </label>
          <div className="habit-stats">
            <span className="streak" title={`Best: ${habit.bestStreak}`}>
              {habit.currentStreak}
              <span className="streak-icon">🔥</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default DailyHabits
