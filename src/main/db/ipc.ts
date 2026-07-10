import { ipcMain } from 'electron'
import { getDb } from './db'
import { DB_CHANNELS } from './ipcChannels'
import { getUser, updateUserProfile, type UserProfileUpdate } from './queries/profile'
import {
  insertFocusSession,
  listRecentFocusSessions,
  listFocusSessionsByDateRange,
  countFocusSessionsByDate,
  totalFocusMinutesByDate,
  type InsertFocusSessionInput
} from './queries/focus'
import { getCurrentExp, getCurrentLevel } from './queries/exp'
import { createHabit, listHabits, archiveHabit, type CreateHabitInput } from './queries/habits'
import {
  toggleHabitCompletion,
  listCompletedPeriods,
  type ToggleHabitCompletionInput
} from './queries/habitCompletions'
import { listLoginDates } from './queries/login'
import {
  insertAiReview,
  listAiReviews,
  listAiReviewsForPeriod,
  archiveAiReview,
  type InsertAiReviewInput,
  type ReviewType
} from './queries/reviews'

/**
 * Registers IPC handlers exposing the local persistence layer to the
 * renderer via the preload bridge. This is plumbing only: no feature file
 * calls these yet (that begins with the Pomodoro/Habit/Dashboard/AI Review
 * tasks). Single-user MVP, so `userId` is never accepted from the renderer.
 */
export function registerDbIpcHandlers(): void {
  ipcMain.handle(DB_CHANNELS.profileGet, () => getUser(getDb()))
  ipcMain.handle(DB_CHANNELS.profileUpdate, (_event, update: UserProfileUpdate) =>
    updateUserProfile(getDb(), update)
  )

  ipcMain.handle(DB_CHANNELS.focusInsert, (_event, input: InsertFocusSessionInput) =>
    insertFocusSession(getDb(), input)
  )
  ipcMain.handle(DB_CHANNELS.focusListRecent, (_event, options?: { limit?: number }) =>
    listRecentFocusSessions(getDb(), options)
  )
  ipcMain.handle(DB_CHANNELS.focusListByDateRange, (_event, startDate: string, endDate: string) =>
    listFocusSessionsByDateRange(getDb(), startDate, endDate)
  )
  ipcMain.handle(DB_CHANNELS.focusCountByDate, (_event, sessionDate: string) =>
    countFocusSessionsByDate(getDb(), sessionDate)
  )
  ipcMain.handle(DB_CHANNELS.focusTotalMinutesByDate, (_event, sessionDate: string) =>
    totalFocusMinutesByDate(getDb(), sessionDate)
  )

  ipcMain.handle(DB_CHANNELS.expGetCurrent, () => getCurrentExp(getDb()))
  ipcMain.handle(DB_CHANNELS.expGetCurrentLevel, () => getCurrentLevel(getDb()))

  ipcMain.handle(DB_CHANNELS.habitsCreate, (_event, input: CreateHabitInput) =>
    createHabit(getDb(), input)
  )
  ipcMain.handle(DB_CHANNELS.habitsList, (_event, options?: { includeArchived?: boolean }) =>
    listHabits(getDb(), options)
  )
  ipcMain.handle(DB_CHANNELS.habitsArchive, (_event, id: string) => archiveHabit(getDb(), id))

  ipcMain.handle(DB_CHANNELS.habitCompletionsToggle, (_event, input: ToggleHabitCompletionInput) =>
    toggleHabitCompletion(getDb(), input)
  )
  ipcMain.handle(DB_CHANNELS.habitCompletionsListCompletedPeriods, (_event, habitId: string) =>
    listCompletedPeriods(getDb(), habitId)
  )

  ipcMain.handle(DB_CHANNELS.loginListDates, () => listLoginDates(getDb()))

  ipcMain.handle(DB_CHANNELS.reviewsInsert, (_event, input: InsertAiReviewInput) =>
    insertAiReview(getDb(), input)
  )
  ipcMain.handle(
    DB_CHANNELS.reviewsList,
    (_event, options?: { includeArchived?: boolean; reviewType?: ReviewType }) =>
      listAiReviews(getDb(), options)
  )
  ipcMain.handle(
    DB_CHANNELS.reviewsListForPeriod,
    (_event, query: { reviewType: ReviewType; periodStart: string; periodEnd: string }) =>
      listAiReviewsForPeriod(getDb(), query)
  )
  ipcMain.handle(DB_CHANNELS.reviewsArchive, (_event, id: number) => archiveAiReview(getDb(), id))
}
