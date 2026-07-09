import type { DashboardMockData } from './mockData'
import { AvatarArt } from './artwork'
import { PencilIcon } from './icons'

interface ProfileHeaderProps {
  profile: DashboardMockData['profile']
}

function ProfileHeader({ profile }: ProfileHeaderProps): React.JSX.Element {
  return (
    <header className="profile-header">
      <div className="profile-avatar-frame">
        <AvatarArt />
        <button type="button" className="avatar-edit" aria-label="Edit profile picture">
          <PencilIcon size={14} />
        </button>
      </div>
      <h1 className="profile-name">{profile.name}</h1>
    </header>
  )
}

export default ProfileHeader
