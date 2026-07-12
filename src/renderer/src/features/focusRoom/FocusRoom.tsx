import { useEffect, useState } from 'react'
import TimerDisplay from './TimerDisplay'
import MusicControls from './MusicControls'
import { onSessionComplete } from './sessionCompletion'
import { calculateFlowChain } from './flowMode'
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

function generateClientEventId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function FocusRoom({
  onNavigateToDashboard,
  durationSeconds = DEFAULT_DURATION_SECONDS
}: FocusRoomProps): React.JSX.Element {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [sessionClientEventId, setSessionClientEventId] = useState<string | null>(null)
  const [expAwarded, setExpAwarded] = useState<number | null>(null)

  // Stats from database
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0)
  const [totalMinutesFocusedToday, setTotalMinutesFocusedToday] = useState(0)
  const [currentExp, setCurrentExp] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [flowChainLength, setFlowChainLength] = useState(0)
  const flowModeActive = flowChainLength >= 4

  // Fetch stats from database
  const fetchStats = async (): Promise<void> => {
    try {
      const todayDate = getTodayDate()
      const [exp, level, sessionCount, focusMinutes] = await Promise.all([
        window.api.db.getCurrentExp(),
        window.api.db.getCurrentLevel(),
        window.api.db.getFocusSessionCountForDate(todayDate),
        window.api.db.getFocusMinutesForDate(todayDate)
      ])

      setCurrentExp(exp)
      setCurrentLevel(level)
      setSessionsCompletedToday(sessionCount)
      setTotalMinutesFocusedToday(focusMinutes)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Load stats on mount
  useEffect(() => {
    // eslint-disable-next-line
    fetchStats()
  }, [])

  // Recompute the Flow Mode chain from the most recent completed sessions.
  const refreshFlowChain = async (): Promise<void> => {
    try {
      const sessions = await window.api.db.listRecentFocusSessions({ limit: 10 })
      const { chainLength } = calculateFlowChain(sessions)
      setFlowChainLength(chainLength)
    } catch (error) {
      console.error('Failed to refresh Flow Mode chain:', error)
    }
  }

  useEffect(() => {
    if (timerStatus !== 'running') return

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        const newSeconds = currentSeconds - 1
        if (newSeconds <= 0) {
          window.clearInterval(intervalId)
          setTimerStatus('idle')

          // Session complete: save to database
          if (sessionStartTime && sessionClientEventId) {
            const actualDurationSeconds = durationSeconds - newSeconds
            const plannedDurationMinutes = Math.floor(durationSeconds / 60)

            onSessionComplete(
              actualDurationSeconds,
              plannedDurationMinutes,
              sessionStartTime,
              sessionClientEventId
            )
              .then((result) => {
                setExpAwarded(result.expAwarded)
                // Refresh stats and the Flow Mode chain after session completion
                fetchStats()
                refreshFlowChain()
                // Clear earned EXP display after 3 seconds
                setTimeout(() => setExpAwarded(null), 3000)
              })
              .catch((error) => {
                console.error('Failed to save session:', error)
              })
          }

          return 0
        }

        return newSeconds
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timerStatus, sessionStartTime, sessionClientEventId, durationSeconds])

  const handleStartPause = (): void => {
    setTimerStatus((currentStatus) => {
      const newStatus = currentStatus === 'running' ? 'paused' : 'running'

      // On first start (idle → running), capture session metadata
      if (currentStatus === 'idle' && newStatus === 'running') {
        if (!sessionStartTime) {
          setSessionStartTime(new Date().toISOString())
          setSessionClientEventId(generateClientEventId())
          setExpAwarded(null)
        }
      }

      return newStatus
    })
  }

  const handleReset = (): void => {
    setTimerStatus('idle')
    setRemainingSeconds(durationSeconds)
    setSessionStartTime(null)
    setSessionClientEventId(null)
    setExpAwarded(null)
  }

  return (
    <main className="focus-room" data-flow-chain-length={flowChainLength}>
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
          currentExp={currentExp}
          currentLevel={currentLevel}
          earnedExp={expAwarded}
        />

        <aside className="focus-controls">
          <MusicControls />
        </aside>

        <footer className="focus-footer">
          <div className="session-info">
            <div>
              <dt>Sessions today</dt>
              <dd>{sessionsCompletedToday}</dd>
            </div>
            <div>
              <dt>Focused time</dt>
              <dd>{totalMinutesFocusedToday}m</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{currentLevel}</dd>
            </div>
            <div>
              <dt>EXP</dt>
              <dd>{currentExp}</dd>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default FocusRoom
