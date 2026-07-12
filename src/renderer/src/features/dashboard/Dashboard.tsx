import { dashboardMockData } from './mockData'
import ProfileHeader from './ProfileHeader'
import LevelRankCard from './LevelRankCard'
import HeroBanner from './HeroBanner'
import OnlineStatusCard from './OnlineStatusCard'
import LoginStreakCard from './LoginStreakCard'
import FeatureCardsRow from './FeatureCardsRow'
import FooterBar from './FooterBar'
import './dashboard.css'

interface DashboardProps {
  onNavigateToFocusRoom?: () => void
  onNavigateToHabitTracker?: () => void
}

function Dashboard({ onNavigateToFocusRoom, onNavigateToHabitTracker }: DashboardProps): React.JSX.Element {
  const data = dashboardMockData

  return (
    <main className="dashboard">
      <div className="dash-grid">
        <ProfileHeader profile={data.profile} />
        <LevelRankCard progress={data.progress} />
        <HeroBanner profileName={data.profile.name} />
        <div className="side-stack">
          <OnlineStatusCard lastOnline={data.onlineStatus.lastOnline} />
          <LoginStreakCard streak={data.loginStreak} consistencyPercent={data.consistencyPercent} />
        </div>
        <FeatureCardsRow
          focusRoom={data.focusRoom}
          habitTracker={data.habitTracker}
          aiReview={data.aiReview}
          onNavigateToFocusRoom={onNavigateToFocusRoom}
          onNavigateToHabitTracker={onNavigateToHabitTracker}
        />
        <FooterBar />
      </div>
    </main>
  )
}

export default Dashboard
