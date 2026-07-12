// Static mock data for the Task 5 Habit Tracker shell.
// Task 8 (Habit Completion Behavior) wires up completion logic and EXP awards.

export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  name: string
  frequency: HabitFrequency
  completedToday: boolean
  currentStreak: number
  bestStreak: number
}

export interface HabitGridEntry {
  date: string // YYYY-MM-DD format
  completed: boolean
  completionRatio: number // 0-1 fraction of habits completed that day, for grid intensity
}

export interface HabitTrackerMockData {
  habits: Habit[]
  totalCompleted: number
  gridHistory: HabitGridEntry[] // Last ~90 days
}

export const habitTrackerMockData: HabitTrackerMockData = {
  habits: [
    {
      id: 'h1',
      name: 'Morning Meditation',
      frequency: 'daily',
      completedToday: true,
      currentStreak: 12,
      bestStreak: 23
    },
    {
      id: 'h2',
      name: 'Exercise',
      frequency: 'daily',
      completedToday: false,
      currentStreak: 0,
      bestStreak: 18
    },
    {
      id: 'h3',
      name: 'Read',
      frequency: 'daily',
      completedToday: true,
      currentStreak: 8,
      bestStreak: 15
    },
    {
      id: 'h4',
      name: 'Review Goals',
      frequency: 'weekly',
      completedToday: true,
      currentStreak: 4,
      bestStreak: 8
    },
    {
      id: 'h5',
      name: 'Cold Shower',
      frequency: 'daily',
      completedToday: true,
      currentStreak: 5,
      bestStreak: 12
    }
  ],
  totalCompleted: 4,
  // Deterministic placeholder history (shown only until the real completion
  // history loads from the database) — a repeating pattern rather than
  // Math.random(), so this initial render is stable and reproducible, and
  // deliberately cycles through all four intensity levels.
  gridHistory: Array.from({ length: 365 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (364 - i))
    const formattedDate = date.toISOString().split('T')[0]
    const ratioPattern = [0, 0, 0.2, 0.5, 0, 0.8, 1, 0, 0.4, 0.6, 0.9, 0]
    const completionRatio = ratioPattern[i % ratioPattern.length]
    return {
      date: formattedDate,
      completed: completionRatio > 0,
      completionRatio
    }
  })
}
