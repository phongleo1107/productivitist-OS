// Static mock data for the Task 4 Focus Room shell.
// Task 7 (Pomodoro Timer Behavior) wires up the timer logic.

export interface FocusRoomMockData {
  sessionTimer: string
  flowModeActive: boolean
  sessionStats: {
    sessionsCompletedToday: number
    totalMinutesFocusedToday: number
    focusScore: number
  }
  focusStreak: number
}

export const focusRoomMockData: FocusRoomMockData = {
  sessionTimer: '25:00',
  flowModeActive: false,
  sessionStats: {
    sessionsCompletedToday: 2,
    totalMinutesFocusedToday: 50,
    focusScore: 78
  },
  focusStreak: 4
}
