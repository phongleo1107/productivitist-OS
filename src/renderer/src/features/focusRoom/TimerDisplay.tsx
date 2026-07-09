interface TimerDisplayProps {
  time: string
  flowModeActive: boolean
  focusScore: number
  streak: number
}

function TimerDisplay({
  time,
  flowModeActive,
  focusScore,
  streak
}: TimerDisplayProps): React.JSX.Element {
  return (
    <div className={`timer-anchor ${flowModeActive ? 'flow-mode' : ''}`}>
      <div className="timer-container">
        <time className="timer-display">{time}</time>
        <button type="button" className="timer-button" aria-label="Start focus session">
          Start
        </button>
        <div className="timer-secondary">
          <span>Focus Score: {focusScore}%</span>
          <span>Streak: {streak}</span>
        </div>
      </div>
    </div>
  )
}

export default TimerDisplay
