// Static mock data for the Task 3 dashboard shell.
// Task 9 (Dashboard Data Integration) replaces this with local aggregates.

export interface MonthLabel {
  label: string
  weekIndex: number
}

export interface DashboardMockData {
  profile: {
    name: string
  }
  progress: {
    level: number
    rank: string
    exp: number
    expToNextLevel: number
  }
  onlineStatus: {
    lastOnline: string
  }
  consistencyPercent: number
  loginStreak: {
    currentStreakDays: number
    weeks: number[][]
    monthLabels: MonthLabel[]
  }
  focusRoom: {
    sessionTimer: string
    focusScorePercent: number
  }
  habitTracker: {
    completedToday: number
    targetToday: number
    bestStreakDays: number
  }
  aiReview: {
    insightsCount: number
    accuracyPercent: number
  }
}

const STREAK_WEEKS = 17
const STREAK_DAYS = STREAK_WEEKS * 7
const CURRENT_STREAK_DAYS = 27

// Deterministic pseudo-random grid so the mock never changes between renders.
// The trailing CURRENT_STREAK_DAYS cells stay non-zero to match the streak count.
function buildStreakWeeks(): number[][] {
  let seed = 20260709
  const next = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const days: number[] = []
  for (let i = 0; i < STREAK_DAYS; i++) {
    const r = next()
    days.push(r < 0.3 ? 0 : Math.min(4, 1 + Math.floor(((r - 0.3) / 0.7) * 4)))
  }
  for (let i = STREAK_DAYS - CURRENT_STREAK_DAYS; i < STREAK_DAYS; i++) {
    if (days[i] === 0) days[i] = 1 + Math.floor(next() * 3)
  }
  const weeks: number[][] = []
  for (let w = 0; w < STREAK_WEEKS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7))
  }
  return weeks
}

export const dashboardMockData: DashboardMockData = {
  profile: {
    name: 'd3xt3r'
  },
  progress: {
    level: 23,
    rank: 'Adept',
    exp: 7850,
    expToNextLevel: 12000
  },
  onlineStatus: {
    lastOnline: 'Today, 2:47 PM'
  },
  consistencyPercent: 82,
  loginStreak: {
    currentStreakDays: CURRENT_STREAK_DAYS,
    weeks: buildStreakWeeks(),
    monthLabels: [
      { label: 'Apr', weekIndex: 1 },
      { label: 'May', weekIndex: 6 },
      { label: 'Jun', weekIndex: 11 }
    ]
  },
  focusRoom: {
    sessionTimer: '25:00',
    focusScorePercent: 82
  },
  habitTracker: {
    completedToday: 8,
    targetToday: 12,
    bestStreakDays: 29
  },
  aiReview: {
    insightsCount: 5,
    accuracyPercent: 91
  }
}
