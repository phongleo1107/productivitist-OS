// Static mock data for the Task 5 Habit Tracker shell.
// Task 8 (Habit Completion Behavior) wires up completion logic and EXP awards.

export interface Habit {
  id: string
  name: string
  frequency: 'daily' | 'weekly'
  completedToday: boolean
  currentStreak: number
  bestStreak: number
}

export interface HabitGridEntry {
  date: string // YYYY-MM-DD format
  completed: boolean
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
  gridHistory: Array.from({ length: 90 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (89 - i))
    const formattedDate = date.toISOString().split('T')[0]
    // ~70% completion rate, clusters of completion and gaps
    const dayOfWeek = date.getDay()
    const week = Math.floor(i / 7)
    const completed =
      (dayOfWeek !== 0 && Math.random() > 0.2) || (dayOfWeek === 0 && Math.random() > 0.6) // weekends less likely
    return {
      date: formattedDate,
      completed: week < 4 ? completed : Math.random() > 0.3 // more consistent recently
    }
  })
}
