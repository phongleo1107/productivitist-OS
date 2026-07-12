export interface HabitToggleResult {
  expAwarded: number
  habitCompleted: boolean
}

function generateClientEventId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** EXP delta for a habit period: 10 when it becomes completed, -10 on reversal (unmark). */
export function calculateHabitEXP(completed: boolean): number {
  return completed ? 10 : -10
}

/**
 * Toggles one habit period's completion in the database and reports the EXP awarded.
 *
 * @param habitId - id of the habit being toggled
 * @param periodStart - local period start (YYYY-MM-DD): the date itself for daily
 * habits, the Monday starting the ISO week for weekly habits
 * @param completed - the new completed state the UI expects after this toggle
 * @returns expAwarded (EXP from this toggle) and habitCompleted (actual resulting state)
 */
export async function onHabitToggle(
  habitId: string,
  periodStart: string,
  completed: boolean
): Promise<HabitToggleResult> {
  const clientEventId = generateClientEventId()

  const completion = await window.api.db.toggleHabitCompletion({
    habitId,
    periodStart,
    clientEventId
  })

  const habitCompleted = completion.completed === 1

  return {
    expAwarded: calculateHabitEXP(completed),
    habitCompleted
  }
}
