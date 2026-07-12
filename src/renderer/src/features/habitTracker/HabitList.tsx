import { useState } from 'react'
import type { Habit } from './mockData'

interface HabitListProps {
  habits: Habit[]
  onToggleHabit: (habitId: string) => void
  onDeleteHabit: (habitId: string) => void
  onReorderHabit: (habitId: string, direction: 'up' | 'down') => void
  flashHabitId?: string | null
}

function HabitList({
  habits,
  onToggleHabit,
  onDeleteHabit,
  onReorderHabit,
  flashHabitId
}: HabitListProps): React.JSX.Element {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number): void => {
    setDraggedIndex(index)
    setDragOverIndex(null)
  }

  const handleDragOver = (index: number): void => {
    setDragOverIndex(index)
  }

  const handleDragLeave = (): void => {
    setDragOverIndex(null)
  }

  const handleDrop = (targetIndex: number): void => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const sourceHabit = habits[draggedIndex]
    const targetHabit = habits[targetIndex]

    // Only allow reordering within the same frequency
    if (sourceHabit.frequency !== targetHabit.frequency) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Determine direction and call onReorderHabit
    if (draggedIndex < targetIndex) {
      for (let i = draggedIndex; i < targetIndex; i++) {
        onReorderHabit(sourceHabit.id, 'down')
      }
    } else {
      for (let i = draggedIndex; i > targetIndex; i--) {
        onReorderHabit(sourceHabit.id, 'up')
      }
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = (): void => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <ul className="habit-list">
      {habits.map((habit, index) => (
        <li
          key={habit.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => {
            e.preventDefault()
            handleDragOver(index)
          }}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`habit-item${flashHabitId === habit.id ? ' habit-item-flash' : ''}${
            draggedIndex === index ? ' habit-item-dragging' : ''
          }${dragOverIndex === index && draggedIndex !== null ? ' habit-item-drag-over' : ''}`}
        >
          <div className="habit-reorder-buttons">
            <button
              type="button"
              className="habit-reorder-button"
              onClick={() => onReorderHabit(habit.id, 'up')}
              disabled={index === 0}
              aria-label={`Move ${habit.name} up`}
              title="Move up"
            >
              ▲
            </button>
            <button
              type="button"
              className="habit-reorder-button"
              onClick={() => onReorderHabit(habit.id, 'down')}
              disabled={index === habits.length - 1}
              aria-label={`Move ${habit.name} down`}
              title="Move down"
            >
              ▼
            </button>
          </div>
          <label className="habit-label">
            <input
              type="checkbox"
              className="habit-checkbox"
              checked={habit.completedToday}
              onChange={() => onToggleHabit(habit.id)}
              aria-label={habit.name}
            />
            <span className="habit-name">{habit.name}</span>
            <span className={`habit-frequency habit-frequency-${habit.frequency}`}>
              {habit.frequency === 'weekly' ? 'Weekly' : 'Daily'}
            </span>
          </label>
          <div className="habit-stats">
            <span
              key={habit.currentStreak}
              className="streak streak-updated"
              title={`Best: ${habit.bestStreak}`}
            >
              {habit.currentStreak}
              <span className="streak-icon">🔥</span>
            </span>
            <button
              type="button"
              className="habit-delete-button"
              onClick={() => onDeleteHabit(habit.id)}
              aria-label={`Delete ${habit.name}`}
              title="Delete habit"
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default HabitList
