import type { DashboardMockData } from './mockData'
import { RankBadge } from './artwork'

interface LevelRankCardProps {
  progress: DashboardMockData['progress']
}

function LevelRankCard({ progress }: LevelRankCardProps): React.JSX.Element {
  const expPercent = Math.round((progress.exp / progress.expToNextLevel) * 100)

  return (
    <section className="card level-card" aria-label="Level and rank">
      <h2 className="card-label">Level &amp; Rank</h2>
      <div className="level-rank-row">
        <div>
          <span className="level-caption">Level</span>
          <span className="level-value">{progress.level}</span>
        </div>
        <div className="rank-block">
          <RankBadge />
          <div>
            <span className="level-caption">Rank</span>
            <span className="rank-value">{progress.rank}</span>
          </div>
        </div>
      </div>
      <div className="exp-block">
        <div className="exp-labels">
          <span>EXP</span>
          <span>
            {progress.exp.toLocaleString('en-US')} /{' '}
            {progress.expToNextLevel.toLocaleString('en-US')}
          </span>
        </div>
        <div
          className="exp-bar"
          role="progressbar"
          aria-label="EXP toward next level"
          aria-valuemin={0}
          aria-valuemax={progress.expToNextLevel}
          aria-valuenow={progress.exp}
        >
          <div className="exp-bar-fill" style={{ width: `${expPercent}%` }} />
        </div>
        <p className="exp-percent">{expPercent}%</p>
      </div>
    </section>
  )
}

export default LevelRankCard
