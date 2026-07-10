/**
 * IPC channel names shared between the main process (handlers) and the
 * preload bridge (invokers). Kept as plain string constants with no
 * Electron/Node imports so this module is safe to import from either side.
 */
export const DB_CHANNELS = {
  profileGet: 'db:profile:get',
  profileUpdate: 'db:profile:update',

  focusInsert: 'db:focus:insert',
  focusListRecent: 'db:focus:listRecent',
  focusListByDateRange: 'db:focus:listByDateRange',
  focusCountByDate: 'db:focus:countByDate',
  focusTotalMinutesByDate: 'db:focus:totalMinutesByDate',

  expGetCurrent: 'db:exp:getCurrent',
  expGetCurrentLevel: 'db:exp:getCurrentLevel',

  habitsCreate: 'db:habits:create',
  habitsList: 'db:habits:list',
  habitsArchive: 'db:habits:archive',

  habitCompletionsToggle: 'db:habitCompletions:toggle',
  habitCompletionsListCompletedPeriods: 'db:habitCompletions:listCompletedPeriods',

  loginListDates: 'db:login:listDates',

  reviewsInsert: 'db:reviews:insert',
  reviewsList: 'db:reviews:list',
  reviewsListForPeriod: 'db:reviews:listForPeriod',
  reviewsArchive: 'db:reviews:archive'
} as const
