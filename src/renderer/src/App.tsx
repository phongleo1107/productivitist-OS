import { useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import FocusRoom from './features/focusRoom/FocusRoom'
import HabitTracker from './features/habitTracker/HabitTracker'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'focusRoom' | 'habitTracker'>('dashboard')

  return currentPage === 'dashboard' ? (
    <Dashboard
      onNavigateToFocusRoom={() => setCurrentPage('focusRoom')}
      onNavigateToHabitTracker={() => setCurrentPage('habitTracker')}
    />
  ) : currentPage === 'focusRoom' ? (
    <FocusRoom onNavigateToDashboard={() => setCurrentPage('dashboard')} />
  ) : (
    <HabitTracker onNavigateToDashboard={() => setCurrentPage('dashboard')} />
  )
}

export default App
