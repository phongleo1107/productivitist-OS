import { useState } from 'react'
import type { HabitFrequency } from './mockData'

interface AddHabitFormProps {
  onAddHabit: (name: string, frequency: HabitFrequency) => Promise<void>
}

function AddHabitForm({ onAddHabit }: AddHabitFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Habit name cannot be empty.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onAddHabit(trimmedName, frequency)
      setName('')
      setFrequency('daily')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add habit.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="add-habit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="add-habit-input"
        placeholder="New habit name…"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={isSubmitting}
        aria-label="New habit name"
      />
      <select
        className="add-habit-select"
        value={frequency}
        onChange={(event) => setFrequency(event.target.value as HabitFrequency)}
        disabled={isSubmitting}
        aria-label="Habit frequency"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <button type="submit" className="add-habit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Adding…' : '+ Add Habit'}
      </button>
      {error && <p className="add-habit-error">{error}</p>}
    </form>
  )
}

export default AddHabitForm
