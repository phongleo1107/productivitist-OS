import type { DashboardMockData } from './mockData'
import { TargetIcon, HabitIcon, BrainIcon, ArrowRightIcon, TrendUpIcon } from './icons'

interface FeatureCardsRowProps {
  focusRoom: DashboardMockData['focusRoom']
  habitTracker: DashboardMockData['habitTracker']
  aiReview: DashboardMockData['aiReview']
  onNavigateToFocusRoom?: () => void
}

function FeatureCardsRow({
  focusRoom,
  habitTracker,
  aiReview,
  onNavigateToFocusRoom
}: FeatureCardsRowProps): React.JSX.Element {
  return (
    <div className="feature-row">
      <section className="card feature-card" aria-label="Focus Room">
        <div className="feature-top">
          <span className="feature-icon" aria-hidden="true">
            <TargetIcon size={26} />
          </span>
          <span className="chip">
            <span className="online-dot small" aria-hidden="true" />
            Active
          </span>
        </div>
        <h2 className="feature-title">Focus Room</h2>
        <div className="feature-bottom">
          <dl className="feature-stats">
            <div>
              <dt>Session Timer</dt>
              <dd>{focusRoom.sessionTimer}</dd>
            </div>
            <div>
              <dt>Focus Score</dt>
              <dd>
                {focusRoom.focusScorePercent}%
                <span className="trend-up">
                  <TrendUpIcon size={14} />
                </span>
                <span className="visually-hidden">trending up</span>
              </dd>
            </div>
          </dl>
          <button type="button" className="cta-button" onClick={onNavigateToFocusRoom}>
            Enter Room <ArrowRightIcon size={15} />
          </button>
        </div>
      </section>

      <section className="card feature-card" aria-label="Habit Tracker">
        <div className="feature-top">
          <span className="feature-icon" aria-hidden="true">
            <HabitIcon size={26} />
          </span>
          <span className="chip chip-accent">
            {habitTracker.completedToday}/{habitTracker.targetToday} Today
          </span>
        </div>
        <h2 className="feature-title">Habit Tracker</h2>
        <div className="feature-bottom">
          <dl className="feature-stats">
            <div>
              <dt>Completed</dt>
              <dd>{habitTracker.completedToday}</dd>
            </div>
            <div>
              <dt>Best Streak</dt>
              <dd>{habitTracker.bestStreakDays} days 🔥</dd>
            </div>
          </dl>
          <button type="button" className="cta-button">
            View Habits <ArrowRightIcon size={15} />
          </button>
        </div>
      </section>

      <section className="card feature-card" aria-label="AI Review">
        <div className="feature-top">
          <span className="feature-icon" aria-hidden="true">
            <BrainIcon size={26} />
          </span>
          <span className="chip chip-accent">New Insights ✨</span>
        </div>
        <h2 className="feature-title">AI Review</h2>
        <div className="feature-bottom">
          <dl className="feature-stats">
            <div>
              <dt>Insights</dt>
              <dd>{aiReview.insightsCount}</dd>
            </div>
            <div>
              <dt>Accuracy</dt>
              <dd>
                {aiReview.accuracyPercent}%
                <span className="trend-up">
                  <TrendUpIcon size={14} />
                </span>
                <span className="visually-hidden">trending up</span>
              </dd>
            </div>
          </dl>
          <button type="button" className="cta-button">
            View Review <ArrowRightIcon size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}

export default FeatureCardsRow
