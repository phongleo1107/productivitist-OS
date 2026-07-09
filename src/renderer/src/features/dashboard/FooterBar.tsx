import { SettingsIcon, PaletteIcon, BellIcon, ChartIcon, ExitIcon } from './icons'

function FooterBar(): React.JSX.Element {
  return (
    <footer className="dash-footer">
      <div className="footer-group">
        <button type="button" className="icon-button" aria-label="Settings">
          <SettingsIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Appearance">
          <PaletteIcon />
        </button>
      </div>
      <div className="footer-group">
        <button type="button" className="icon-button has-dot" aria-label="Notifications (unread)">
          <BellIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Stats">
          <ChartIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Exit">
          <ExitIcon />
        </button>
      </div>
    </footer>
  )
}

export default FooterBar
