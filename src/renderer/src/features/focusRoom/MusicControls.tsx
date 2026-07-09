function MusicControls(): React.JSX.Element {
  return (
    <div className="music-block">
      <h2 className="music-label">Environment</h2>

      <div className="control-section">
        <label htmlFor="music-select">Music</label>
        <select id="music-select" className="control-select">
          <option>Spotify</option>
          <option>Local files</option>
          <option>None</option>
        </select>
      </div>

      <div className="control-section">
        <label htmlFor="ambient-select">Ambient</label>
        <select id="ambient-select" className="control-select">
          <option>None</option>
          <option>Rain</option>
          <option>Forest</option>
          <option>Coffee shop</option>
        </select>
      </div>

      <div className="control-section">
        <label htmlFor="background-select">Background</label>
        <select id="background-select" className="control-select">
          <option>Default</option>
          <option>Mountain</option>
          <option>Ocean</option>
          <option>Night sky</option>
        </select>
      </div>

      <button type="button" className="settings-btn" aria-label="Advanced settings">
        ⚙
      </button>
    </div>
  )
}

export default MusicControls
