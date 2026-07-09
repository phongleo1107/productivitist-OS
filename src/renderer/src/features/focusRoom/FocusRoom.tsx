import { focusRoomMockData } from './mockData'
import TimerDisplay from './TimerDisplay'
import MusicControls from './MusicControls'
import './focusRoom.css'

function FocusRoom(): React.JSX.Element {
  const { sessionTimer, flowModeActive, sessionStats, focusStreak } = focusRoomMockData

  return (
    <main className="focus-room">
      <div className="focus-room-layout">
        <TimerDisplay
          time={sessionTimer}
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
