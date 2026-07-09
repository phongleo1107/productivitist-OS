import { useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import FocusRoom from './features/focusRoom/FocusRoom'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'focusRoom'>('dashboard')

  return currentPage === 'dashboard' ? (
    <Dashboard onNavigateToFocusRoom={() => setCurrentPage('focusRoom')} />
  ) : (
    <FocusRoom onNavigateToDashboard={() => setCurrentPage('dashboard')} />
  )
}

export default App
