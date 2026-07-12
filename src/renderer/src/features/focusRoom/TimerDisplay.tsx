interface TimerDisplayProps {
  time: string
  remainingSeconds: number
  isRunning: boolean
  onStartPause: () => void
  onReset: () => void
  resetDisabled: boolean
  flowModeActive: boolean
  currentExp: number
  currentLevel: number
  earnedExp: number | null
}

function TimerDisplay({
  time,
  remainingSeconds,
  isRunning,
  onStartPause,
  onReset,
  resetDisabled,
  flowModeActive,
  currentExp,
  currentLevel,
  earnedExp
}: TimerDisplayProps): React.JSX.Element {
  return (
    <div className={`timer-anchor ${flowModeActive ? 'flow-mode' : ''}`}>
      <div className="timer-container">
        <time className="timer-display" dateTime={`PT${remainingSeconds}S`}>
          {time}
        </time>
        <div className="timer-actions">
          <button
            type="button"
            className="timer-button"
            onClick={onStartPause}
            disabled={remainingSeconds === 0}
            aria-label={isRunning ? 'Pause focus session' : 'Start focus session'}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            className="timer-reset-button"
            onClick={onReset}
            disabled={resetDisabled}
          >
            Reset
          </button>
        </div>
        <div className="timer-secondary">
          <span>Level: {currentLevel}</span>
          <span>EXP: {currentExp}</span>
        </div>
        {earnedExp !== null && (
          <div className="exp-earned-toast">
            <span>+ {earnedExp} EXP</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimerDisplay
