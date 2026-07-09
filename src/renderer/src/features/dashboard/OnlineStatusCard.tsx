import { ClockIcon } from './icons'

interface OnlineStatusCardProps {
  lastOnline: string
}

function OnlineStatusCard({ lastOnline }: OnlineStatusCardProps): React.JSX.Element {
  return (
    <section className="card online-card" aria-label="Online status">
      <h2 className="card-label">Online Status</h2>
      <p className="online-now">
        <span className="online-dot" aria-hidden="true" />
        Currently Online
      </p>
      <p className="online-last">
        <ClockIcon size={15} />
        Last Online: {lastOnline}
      </p>
    </section>
  )
}

export default OnlineStatusCard
