import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DB_CHANNELS } from '../main/db/ipcChannels'
import type { UserRow, UserProfileUpdate } from '../main/db/queries/profile'
import type { FocusSessionRow, InsertFocusSessionInput } from '../main/db/queries/focus'
import type { HabitRow, CreateHabitInput } from '../main/db/queries/habits'
import type {
  HabitCompletionRow,
  ToggleHabitCompletionInput
} from '../main/db/queries/habitCompletions'
import type { AiReviewRow, InsertAiReviewInput, ReviewType } from '../main/db/queries/reviews'

// Custom APIs for renderer: a narrow bridge to the local persistence layer.
// No feature UI calls these yet (Tasks 7-11 wire specific behavior); this is
// plumbing only.
const api = {
  db: {
    getUser: (): Promise<UserRow> => ipcRenderer.invoke(DB_CHANNELS.profileGet),
    updateUserProfile: (update: UserProfileUpdate): Promise<UserRow> =>
      ipcRenderer.invoke(DB_CHANNELS.profileUpdate, update),

    insertFocusSession: (input: InsertFocusSessionInput): Promise<FocusSessionRow> =>
      ipcRenderer.invoke(DB_CHANNELS.focusInsert, input),
    listRecentFocusSessions: (options?: { limit?: number }): Promise<FocusSessionRow[]> =>
      ipcRenderer.invoke(DB_CHANNELS.focusListRecent, options),
    listFocusSessionsByDateRange: (
      startDate: string,
      endDate: string
    ): Promise<FocusSessionRow[]> =>
      ipcRenderer.invoke(DB_CHANNELS.focusListByDateRange, startDate, endDate),

    createHabit: (input: CreateHabitInput): Promise<HabitRow> =>
      ipcRenderer.invoke(DB_CHANNELS.habitsCreate, input),
    listHabits: (options?: { includeArchived?: boolean }): Promise<HabitRow[]> =>
      ipcRenderer.invoke(DB_CHANNELS.habitsList, options),
    archiveHabit: (id: string): Promise<HabitRow> =>
      ipcRenderer.invoke(DB_CHANNELS.habitsArchive, id),

    toggleHabitCompletion: (input: ToggleHabitCompletionInput): Promise<HabitCompletionRow> =>
      ipcRenderer.invoke(DB_CHANNELS.habitCompletionsToggle, input),
    listCompletedPeriods: (habitId: string): Promise<string[]> =>
      ipcRenderer.invoke(DB_CHANNELS.habitCompletionsListCompletedPeriods, habitId),

    listLoginDates: (): Promise<string[]> => ipcRenderer.invoke(DB_CHANNELS.loginListDates),

    insertAiReview: (input: InsertAiReviewInput): Promise<AiReviewRow> =>
      ipcRenderer.invoke(DB_CHANNELS.reviewsInsert, input),
    listAiReviews: (options?: {
      includeArchived?: boolean
      reviewType?: ReviewType
    }): Promise<AiReviewRow[]> => ipcRenderer.invoke(DB_CHANNELS.reviewsList, options),
    listAiReviewsForPeriod: (query: {
      reviewType: ReviewType
      periodStart: string
      periodEnd: string
    }): Promise<AiReviewRow[]> => ipcRenderer.invoke(DB_CHANNELS.reviewsListForPeriod, query),
    archiveAiReview: (id: number): Promise<AiReviewRow> =>
      ipcRenderer.invoke(DB_CHANNELS.reviewsArchive, id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export type Api = typeof api
