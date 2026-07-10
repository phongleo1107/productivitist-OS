import { useEffect, useState } from 'react'
import { focusRoomMockData } from './mockData'
import TimerDisplay from './TimerDisplay'
import MusicControls from './MusicControls'
import './focusRoom.css'

interface FocusRoomProps {
  onNavigateToDashboard?: () => void
  durationSeconds?: number
}

type TimerStatus = 'idle' | 'running' | 'paused'

const DEFAULT_DURATION_SECONDS = 25 * 60

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function FocusRoom({
  onNavigateToDashboard,
  durationSeconds = DEFAULT_DURATION_SECONDS
}: FocusRoomProps): React.JSX.Element {
  const { flowModeActive, sessionStats, focusStreak } = focusRoomMockData
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)

  useEffect(() => {
    if (timerStatus !== 'running') return

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId)
          setTimerStatus('idle')
          return 0
        }

        return currentSeconds - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timerStatus])

  const handleStartPause = (): void => {
    setTimerStatus((currentStatus) => (currentStatus === 'running' ? 'paused' : 'running'))
  }

  const handleReset = (): void => {
    setTimerStatus('idle')
    setRemainingSeconds(durationSeconds)
  }

  return (
    <main className="focus-room">
      <button
        type="button"
        className="back-button"
        onClick={onNavigateToDashboard}
        aria-label="Back to dashboard"
      >
        ← Back
      </button>

      <div className="focus-room-layout">
        <TimerDisplay
          time={formatTime(remainingSeconds)}
          remainingSeconds={remainingSeconds}
          isRunning={timerStatus === 'running'}
          onStartPause={handleStartPause}
          onReset={handleReset}
          resetDisabled={timerStatus === 'idle' && remainingSeconds === durationSeconds}
          flowModeActive={flowModeActive}
          focusScore={sessionStats.focusScore}
          streak={focusStreak}
        />

        <aside className="focus-controls">
          <MusicControls />
        </aside>

        <footer className="focus-footer">
          <div className="session-info">
            <div>
              <dt>Sessions today</dt>
              <dd>{sessionStats.sessionsCompletedToday}</dd>
            </div>
            <div>
              <dt>Focused time</dt>
              <dd>{sessionStats.totalMinutesFocusedToday}m</dd>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default FocusRoom
