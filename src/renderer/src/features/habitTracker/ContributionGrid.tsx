import type { HabitGridEntry } from './mockData'

interface ContributionGridProps {
  history: HabitGridEntry[]
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

// GitHub shows only Mon/Wed/Fri (rows 1, 3, 5 when Sunday is row 0).
const AXIS_DAYS: { dayOfWeek: number; label: string }[] = [
  { dayOfWeek: 1, label: 'Mon' },
  { dayOfWeek: 3, label: 'Wed' },
  { dayOfWeek: 5, label: 'Fri' }
]

function levelForRatio(ratio: number): 'empty' | 'low' | 'medium' | 'high' {
  if (ratio <= 0) return 'empty'
  if (ratio <= 0.33) return 'low'
  if (ratio <= 0.66) return 'medium'
  return 'high'
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

interface CalendarCell {
  date: string
  weekIndex: number
  dayOfWeek: number // 0 = Sunday ... 6 = Saturday
  entry: HabitGridEntry | null
}

/**
 * Builds a flat list of calendar cells (real dates for every position,
 * including padding at the start/end of the first/last week) rather than
 * grouping the raw history array whenever a Sunday is encountered. Every
 * cell always carries its true calendar date and weekday, so placement is
 * driven by that date rather than by array position.
 */
function buildCalendarCells(history: HabitGridEntry[]): {
  cells: CalendarCell[]
  weekCount: number
} {
  if (history.length === 0) return { cells: [], weekCount: 0 }

  const entryByDate = new Map(history.map((entry) => [entry.date, entry]))

  const firstDate = new Date(`${history[0].date}T00:00:00Z`)
  const lastDate = new Date(`${history[history.length - 1].date}T00:00:00Z`)

  // Walk back to the Sunday that starts the first date's week, so week
  // columns are always full Sun-Sat spans and dates never shift row.
  const startDate = new Date(firstDate)
  startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay())

  // Walk forward to the Saturday that ends the last date's week.
  const endDate = new Date(lastDate)
  endDate.setUTCDate(endDate.getUTCDate() + (6 - endDate.getUTCDay()))

  const cells: CalendarCell[] = []
  const cursor = new Date(startDate)
  let dayIndex = 0

  while (cursor <= endDate) {
    const dateKey = toDateKey(cursor)
    cells.push({
      date: dateKey,
      weekIndex: Math.floor(dayIndex / 7),
      dayOfWeek: cursor.getUTCDay(),
      entry: entryByDate.get(dateKey) ?? null
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    dayIndex += 1
  }

  return { cells, weekCount: Math.ceil(dayIndex / 7) }
}

// Minimum week columns required between two visible month labels. Below
// this, labels visually crowd each other — most commonly a short partial
// month at the very start of the rolling year, immediately followed by the
// next (full) month.
const MIN_LABEL_GAP_WEEKS = 2

/** The week column where each month first becomes visible. */
function buildMonthLabels(cells: CalendarCell[]): { weekIndex: number; label: string }[] {
  const candidates: { weekIndex: number; label: string }[] = []
  let lastMonth = -1

  for (const cell of cells) {
    if (!cell.entry) continue
    const month = new Date(`${cell.date}T00:00:00Z`).getUTCMonth()
    if (month === lastMonth) continue
    lastMonth = month
    candidates.push({ weekIndex: cell.weekIndex, label: MONTH_NAMES[month] })
  }

  // Always anchor the beginning of the rolling range. If the next month
  // starts too close to that label, omit the later label instead of replacing
  // the first one and leaving an unexplained blank above the opening weeks.
  const result: { weekIndex: number; label: string }[] = []
  for (const candidate of candidates) {
    const previous = result[result.length - 1]
    if (!previous || candidate.weekIndex - previous.weekIndex >= MIN_LABEL_GAP_WEEKS) {
      result.push(candidate)
    }
  }

  return result
}

function ContributionGrid({ history }: ContributionGridProps): React.JSX.Element {
  const { cells, weekCount } = buildCalendarCells(history)
  const monthLabels = buildMonthLabels(cells)
  const activeDays = history.filter((entry) => entry.completed).length

  // One shared grid: column 1 is the fixed weekday-label gutter, columns
  // 2..weekCount+1 are the week columns; row 1 is month labels, rows 2-8 are
  // Sun..Sat. Every label and cell is placed by integer grid-column/grid-row
  // coordinates in this same grid, so there is no separate pixel-based
  // positioning system that could drift out of sync with the cells.
  const gridTemplateColumns = `28px repeat(${weekCount}, 12px)`

  return (
    <div className="contribution-grid-container">
      <div className="grid-scroll">
        <div className="contribution-graph">
          <div
            className="calendar-grid"
            style={{ gridTemplateColumns }}
            role="grid"
            aria-label={`Habit completion history for the last year: ${activeDays} active ${activeDays === 1 ? 'day' : 'days'}`}
          >
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`month-${label}-${weekIndex}`}
                className="month-label"
                style={{ gridColumn: weekIndex + 2, gridRow: 1 }}
                aria-hidden="true"
              >
                {label}
              </span>
            ))}

            {AXIS_DAYS.map(({ dayOfWeek, label }) => (
              <span
                key={`axis-${label}`}
                className="day-axis-label"
                style={{ gridColumn: 1, gridRow: dayOfWeek + 2 }}
                aria-hidden="true"
              >
                {label}
              </span>
            ))}

            {cells.map((cell) => {
              const style = { gridColumn: cell.weekIndex + 2, gridRow: cell.dayOfWeek + 2 }
              if (!cell.entry) {
                return (
                  <span
                    key={cell.date}
                    className="day-cell day-cell-placeholder"
                    style={style}
                    aria-hidden="true"
                  />
                )
              }
              const level = levelForRatio(cell.entry.completionRatio)
              const percent = Math.round(cell.entry.completionRatio * 100)
              const description = cell.entry.completed
                ? `${percent}% of habits completed`
                : 'no habits completed'
              return (
                <span
                  key={cell.date}
                  className={`day-cell level-${level}`}
                  style={style}
                  role="gridcell"
                  aria-label={`${cell.date}: ${description}`}
                  title={`${cell.date}: ${description}`}
                />
              )
            })}
          </div>

          <div className="grid-footer">
            <span className="grid-summary">
              {activeDays} active {activeDays === 1 ? 'day' : 'days'} in the last year
            </span>
            <div className="grid-legend" aria-label="Completion intensity from less to more">
              <span className="legend-label">Less</span>
              <div className="legend-cells" aria-hidden="true">
                <span className="day-cell level-empty" />
                <span className="day-cell level-low" />
                <span className="day-cell level-medium" />
                <span className="day-cell level-high" />
              </div>
              <span className="legend-label">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributionGrid
